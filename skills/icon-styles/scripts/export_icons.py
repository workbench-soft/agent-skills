#!/usr/bin/env python3
"""Turn one icon SVG into the PNG, ICO and app icon sets a repo needs.

Usage: export_icons.py ICON.svg --out DIR [--small SMALL.svg]
                       [--targets png,windows,web,android,ios,expo]
                       [--background "#101820"]

Renders through the resvg CLI, which mise installs:
    mise x python@3.13 github:linebender/resvg@0.49.0 -- python export_icons.py ...

--small replaces ICON.svg at 32 px and below. --background fills the icons
a platform wants opaque or padded: iOS, the PWA maskable icon, Expo.
Standard library only.
"""

import argparse
import base64
import shutil
import struct
import subprocess
import sys
import zlib
from pathlib import Path

TARGETS = ("png", "windows", "web", "android", "ios", "expo")
PNG_SIZES = (16, 24, 32, 48, 64, 128, 256, 512, 1024)
WINDOWS_ICO = (16, 20, 24, 32, 40, 48, 64, 96, 256)
FAVICON_ICO = (16, 32, 48)
# Launcher icon size per density, in px. The adaptive foreground is 108 dp.
ANDROID = {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}
# The share of the canvas a platform promises to show uncropped.
MASKABLE_SAFE = 0.8
ADAPTIVE_SAFE = 66 / 108


class Renderer:
    def __init__(self, icon: Path, small: Path | None, resvg: str):
        self.icon = icon.read_text(encoding="utf-8")
        self.small = small.read_text(encoding="utf-8") if small else self.icon
        self.resvg = resvg

    def png(self, size: int, scale: float = 1.0, background: str | None = None) -> bytes:
        """Render at size px. A scale under 1 centres the icon on a padded canvas."""
        svg = self.small if size <= 32 else self.icon
        if scale != 1.0 or background:
            svg = wrap(svg, size, scale, background)
        args = [self.resvg, "-w", str(size), "-h", str(size), "-", "-c"]
        done = subprocess.run(args, check=False, input=svg.encode("utf-8"), capture_output=True)
        if done.returncode != 0:
            sys.exit(f"resvg failed at {size} px: {done.stderr.decode(errors='replace')}")
        return done.stdout


def wrap(svg: str, size: int, scale: float, background: str | None) -> str:
    """Put the icon in a square canvas, scaled about the centre, on a fill."""
    inner = size * scale
    offset = (size - inner) / 2
    data = base64.b64encode(svg.encode("utf-8")).decode("ascii")
    fill = f'<rect width="{size}" height="{size}" fill="{background}"/>' if background else ""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" '
        f'viewBox="0 0 {size} {size}">{fill}'
        f'<image x="{offset}" y="{offset}" width="{inner}" height="{inner}" '
        f'href="data:image/svg+xml;base64,{data}"/></svg>'
    )


def chunk(kind: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data))


def opaque(png: bytes) -> bytes:
    """Drop the alpha channel of an 8 bit RGBA PNG, as resvg writes it."""
    pos, idat, header = 8, b"", b""
    while pos < len(png):
        (length,), kind = struct.unpack(">I", png[pos : pos + 4]), png[pos + 4 : pos + 8]
        data = png[pos + 8 : pos + 8 + length]
        if kind == b"IHDR":
            header = data
        elif kind == b"IDAT":
            idat += data
        pos += 12 + length
    width, height, depth, color = struct.unpack(">IIBB", header[:10])
    if (depth, color) != (8, 6):
        sys.exit(f"expected an 8 bit RGBA PNG from resvg, got depth {depth} color {color}")
    raw, stride = zlib.decompress(idat), width * 4
    prev, rows = bytearray(stride), bytearray()
    for y in range(height):
        start = y * (stride + 1)
        kind, line = raw[start], bytearray(raw[start + 1 : start + 1 + stride])
        for i in range(stride):
            a = line[i - 4] if i >= 4 else 0
            b, c = prev[i], prev[i - 4] if i >= 4 else 0
            if kind == 1:
                line[i] = (line[i] + a) & 0xFF
            elif kind == 2:
                line[i] = (line[i] + b) & 0xFF
            elif kind == 3:
                line[i] = (line[i] + (a + b) // 2) & 0xFF
            elif kind == 4:
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                line[i] = (line[i] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 0xFF
        rows += b"\x00" + bytes(v for i, v in enumerate(line) if i % 4 != 3)
        prev = line
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    return png[:8] + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(bytes(rows), 9)) + chunk(b"IEND", b"")


def ico(images: list[tuple[int, bytes]]) -> bytes:
    """Pack PNGs into one .ico. Windows reads PNG entries at every size."""
    header = struct.pack("<HHH", 0, 1, len(images))
    entries, blobs = b"", b""
    offset = len(header) + 16 * len(images)
    for size, blob in images:
        side = 0 if size >= 256 else size  # 0 means 256 in the ICO header.
        entries += struct.pack("<BBBBHHII", side, side, 0, 0, 1, 32, len(blob), offset + len(blobs))
        blobs += blob
    return header + entries + blobs


def write(path: Path, blob: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(blob)
    print(path)


def export(r: Renderer, icon: Path, out: Path, targets: list[str], background: str) -> None:
    if "png" in targets:
        for size in PNG_SIZES:
            write(out / "png" / f"icon-{size}.png", r.png(size))
    if "windows" in targets:
        write(out / "windows" / "icon.ico", ico([(s, r.png(s)) for s in WINDOWS_ICO]))
    if "web" in targets:
        web = out / "web"
        write(web / "favicon.ico", ico([(s, r.png(s)) for s in FAVICON_ICO]))
        web.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(icon, web / "favicon.svg")
        print(web / "favicon.svg")
        write(web / "apple-touch-icon.png", r.png(180, background=background))
        write(web / "icon-192.png", r.png(192))
        write(web / "icon-512.png", r.png(512))
        write(web / "icon-maskable-512.png", r.png(512, MASKABLE_SAFE, background))
    if "android" in targets:
        for density, factor in ANDROID.items():
            folder = out / "android" / f"mipmap-{density}"
            write(folder / "ic_launcher.png", r.png(round(48 * factor)))
            write(folder / "ic_launcher_foreground.png", r.png(round(108 * factor), ADAPTIVE_SAFE))
        write(out / "android" / "play-store-512.png", r.png(512, background=background))
    if "ios" in targets:
        # App Store Connect rejects an icon with alpha, and iOS rounds the corners itself.
        write(out / "ios" / "AppIcon-1024.png", opaque(r.png(1024, background=background)))
    if "expo" in targets:
        # Expo builds the iOS icon from icon.png, so it drops the alpha too.
        write(out / "expo" / "icon.png", opaque(r.png(1024, background=background)))
        write(out / "expo" / "adaptive-icon.png", r.png(1024, ADAPTIVE_SAFE))
        write(out / "expo" / "favicon.png", r.png(48))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("icon", type=Path)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--small", type=Path, help="simpler SVG for 32 px and below")
    parser.add_argument("--targets", default="png,windows,web", help=",".join(TARGETS))
    parser.add_argument("--background", default="#ffffff", help="fill for opaque icons")
    parser.add_argument("--resvg", default="resvg", help="path to the resvg binary")
    args = parser.parse_args()

    targets = [t.strip() for t in args.targets.split(",") if t.strip()]
    unknown = sorted(set(targets) - set(TARGETS))
    if unknown:
        sys.exit(f"unknown target: {', '.join(unknown)}. Pick from {', '.join(TARGETS)}")
    if shutil.which(args.resvg) is None:
        sys.exit("resvg is not on PATH. Run through: mise x github:linebender/resvg@0.49.0 -- ...")
    export(Renderer(args.icon, args.small, args.resvg), args.icon, args.out, targets, args.background)


if __name__ == "__main__":
    main()
