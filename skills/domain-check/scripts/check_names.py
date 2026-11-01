#!/usr/bin/env python3
"""Check brand names against .com, .com.au, .au, ABN Lookup and IP Australia.

Usage: check_names.py [--json] [--file names.txt] [--confirm 10] NAME...

A name may hold spaces ("Kiwi Nest"). The domain label drops everything but
letters, digits and hyphens ("kiwinest"), after accents fold ("Café" to
"cafe"). Standard library only.
"""

import argparse
import html
import http.client
import json
import random
import re
import socket
import struct
import sys
import threading
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

USER_AGENT = "domain-check/1.0 (+https://github.com/workbench-soft/agent-skills)"
TIMEOUT = 20

ZONES = ("com", "com.au", "au")
RDAP_COM = "https://rdap.verisign.com/com/v1/domain/{}.com"
RESOLVERS = ("1.1.1.1", "8.8.8.8")
# auDA bans an address for a day after about 15 quick RDAP lookups, and its
# whois stops answering after about 30. So .au names go through DNS first,
# and whois only confirms the finalists, one at a time.
WHOIS_AU = ("whois.auda.org.au", 43)
WHOIS_GAP = 2.0
ABR_URL = "https://abr.business.gov.au/Search/ResultsActive?SearchText={}"
TM_URL = "https://search.ipaustralia.gov.au/trademarks/search/quick/result?q={}&p={}"
TM_VIEW = "https://search.ipaustralia.gov.au/trademarks/search/view/{}"

# A mark in one of these states no longer blocks the name.
TM_DEAD = (
    "lapsed",
    "removed",
    "refused",
    "withdrawn",
    "cancelled",
    "revoked",
    "expired",
    "never registered",
    "rejected",
)
COMPANY_SUFFIX = re.compile(
    r"\b(pty\.?|proprietary|ltd\.?|limited|inc\.?|incorporated|co\.?|"
    r"company|corp\.?|corporation|holdings|group|the|trust|trustee for)\b"
)

# Each host gets its own limit, so one slow register doesn't hold up the rest.
LIMITS = {
    "verisign": threading.Semaphore(4),
    "dns": threading.Semaphore(8),
    "abr": threading.Semaphore(2),
    "tm": threading.Semaphore(2),
}


def fetch(url, host):
    """Return (status, body). Retries 429 and 5xx with a backoff."""
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(4):
        with LIMITS[host]:
            try:
                with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
                    return response.status, response.read().decode("utf-8", "replace")
            except urllib.error.HTTPError as error:
                if error.code not in (429, 500, 502, 503, 504):
                    return error.code, ""
            # A reply cut off mid body raises IncompleteRead or a reset, and gets the retry too.
            except (OSError, http.client.HTTPException):
                pass
        time.sleep(2**attempt)
    raise RuntimeError(f"no answer from {url}")


# Letters NFKD leaves whole.
FOLD = str.maketrans({"æ": "ae", "ø": "o", "œ": "oe", "ß": "ss", "ł": "l", "đ": "d", "þ": "th"})


def ascii_fold(text):
    # "Café" becomes "cafe", so the label and the register match keep the letter.
    text = unicodedata.normalize("NFKD", text.lower().translate(FOLD))
    return text.encode("ascii", "ignore").decode()


def squash(text):
    return re.sub(r"[^a-z0-9]", "", ascii_fold(text))


def label_of(name):
    return re.sub(r"[^a-z0-9-]", "", ascii_fold(name).replace(" ", "")).strip("-")


def text_of(fragment):
    return " ".join(html.unescape(re.sub(r"<[^>]+>", " ", fragment)).split())


def dns_exists(domain):
    """True when the zone holds the name, False on NXDOMAIN."""
    query_id = random.randrange(1 << 16)
    question = b"".join(bytes([len(part)]) + part.encode() for part in domain.split("."))
    # Recursion desired, DNSSEC checks off, so a broken signature still answers.
    packet = struct.pack(">HHHHHH", query_id, 0x0110, 1, 0, 0, 0) + question + b"\0"
    packet += struct.pack(">HH", 2, 1)  # NS record, IN class
    with LIMITS["dns"]:
        for resolver in RESOLVERS * 2:
            with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
                sock.settimeout(3)
                try:
                    sock.sendto(packet, (resolver, 53))
                    answer = sock.recv(4096)
                except OSError:
                    continue
            if len(answer) < 4 or struct.unpack(">H", answer[:2])[0] != query_id:
                continue
            rcode = answer[3] & 0x0F
            # SERVFAIL comes from a name the zone delegates to dead servers.
            if rcode in (0, 2):
                return True
            if rcode == 3:
                return False
    raise RuntimeError(f"no DNS answer for {domain}")


def check_domain(label, zone):
    if zone != "com":
        return "taken" if dns_exists(f"{label}.{zone}") else "free?"
    status, _ = fetch(RDAP_COM.format(label), "verisign")
    if status == 200:
        return "taken"
    if status == 404:
        return "free"
    return f"error {status}"


def whois_au(domain):
    """'free' or 'taken' from the auDA whois, or None when it doesn't answer."""
    try:
        with socket.create_connection(WHOIS_AU, timeout=10) as sock:
            sock.sendall(domain.encode() + b"\r\n")
            answer = b""
            while chunk := sock.recv(4096):
                answer += chunk
    except OSError:
        return None
    first = answer.decode("utf-8", "replace").strip().lower()
    if first.startswith("domain not found"):
        return "free"
    if first.startswith("domain name:"):
        return "taken"
    return None


def check_abr(name):
    """Active entity, business and trading names that match the name."""
    _, body = fetch(ABR_URL.format(urllib.parse.quote(name)), "abr")
    if "No matching names found" in body:
        return {"exact": [], "similar": 0}
    if "Matching names" not in body:
        raise RuntimeError("ABN Lookup page has no results table")
    table = body[body.find("Matching names") :]
    target = squash(name)
    exact, similar = [], 0
    for row in re.findall(r"<tr>(.*?)</tr>", table, re.DOTALL):
        cells = re.findall(r"<td[^>]*>(.*?)</td>", row, re.DOTALL)
        if len(cells) < 4:
            continue
        entity = text_of(cells[1])
        core = squash(COMPANY_SUFFIX.sub(" ", entity.lower()))
        if core == target:
            exact.append(
                {
                    "name": entity,
                    "type": text_of(cells[2]),
                    "abn": text_of(re.sub(r"<span.*", "", cells[0], flags=re.DOTALL)),
                    "where": text_of(cells[3]),
                }
            )
        elif target in core:
            similar += 1
    return {"exact": exact, "similar": similar}


def check_trade_marks(name):
    """Live marks with the same words, and live marks that contain them."""
    target = squash(name)
    exact, similar, total, seen = [], 0, 0, 0
    for page in range(2):
        _, body = fetch(TM_URL.format(urllib.parse.quote(name), page), "tm")
        found = re.search(r'qa-count">([\d,]+)<', body)
        if not found:
            raise RuntimeError("trade mark search page has no result count")
        total = int(found.group(1).replace(",", ""))
        records = re.findall(r'<tbody id="TM(\d+)"(.*?)</tbody>', body, re.DOTALL)
        # A count with no rows means the page changed, and the name would read free.
        if total and not records:
            raise RuntimeError("trade mark search page has a count but no rows")
        seen += len(records)
        for number, record in records:
            words = re.search(r'class="trademark words"[^>]*>(.*?)</td>', record, re.DOTALL)
            status = re.search(r'class="status"[^>]*>(.*?)</td>', record, re.DOTALL)
            classes = re.search(r'class="classes[^"]*"[^>]*>(.*?)</td>', record, re.DOTALL)
            owner = re.search(r"<dt>Owners:</dt>\s*<dd>(.*?)</dd>", record, re.DOTALL)
            # The status cell opens with a coloured dot, "● Lapsed".
            state = text_of(status.group(1)).lstrip("● ") if status else ""
            mark = squash(text_of(words.group(1))) if words else ""
            if not mark or state.lower().startswith(TM_DEAD):
                continue
            if mark == target:
                exact.append(
                    {
                        "number": number,
                        "status": state.split(":")[0],
                        "classes": text_of(classes.group(1)) if classes else "",
                        "owner": text_of(owner.group(1)) if owner else "",
                        "url": TM_VIEW.format(number),
                    }
                )
            elif target in mark:
                similar += 1
        if total <= 100 * (page + 1):
            break
    # The results come oldest first, so a newer live mark can sit on a page left unread.
    return {"exact": exact, "similar": similar, "results": total, "unread": max(0, total - seen)}


def verdict(row):
    domains, abr, tm = row["domains"], row["abr"], row["trade_marks"]
    if isinstance(tm, dict) and tm["exact"]:
        return "taken", "live trade mark with these words"
    if domains["com.au"] == "taken":
        return "taken", ".com.au is registered"
    reasons = [f".{zone} is registered" for zone, state in domains.items() if state == "taken"]
    if isinstance(abr, dict) and abr["exact"]:
        reasons.append("an active business uses the name")
    if isinstance(tm, dict) and tm["similar"]:
        reasons.append(f"{tm['similar']} live marks contain the words")
    if isinstance(tm, dict) and tm.get("unread"):
        reasons.append(f"{tm['unread']} newer trade mark results unread")
    if reasons:
        return "risky", "; ".join(reasons)
    errors = [zone for zone, state in domains.items() if state.startswith("error")]
    errors += [key for key in ("abr", "trade_marks") if isinstance(row[key], str)]
    if errors:
        return "unknown", "check failed: " + ", ".join(errors)
    if "free?" in domains.values():
        return "free", "free in DNS, whois unconfirmed"
    return "free", "all domains free, no matching business or mark"


def check(name):
    label = label_of(name)
    row = {"name": name, "label": label}

    def guard(job, *args):
        try:
            return job(*args)
        except Exception as error:  # noqa: BLE001 A failed check marks the row, the batch goes on.
            return f"error: {error}"

    with ThreadPoolExecutor(max_workers=5) as pool:
        zones = {zone: pool.submit(guard, check_domain, label, zone) for zone in ZONES}
        abr = pool.submit(guard, check_abr, name)
        tm = pool.submit(guard, check_trade_marks, name)
        row["domains"] = {zone: job.result() for zone, job in zones.items()}
        row["abr"] = abr.result()
        row["trade_marks"] = tm.result()
    row["verdict"], row["why"] = verdict(row)
    return row


def confirm(rows, budget):
    """Ask the auDA whois about .au names DNS called free, best rows first."""
    asked = 0
    for row in rows:
        if row["verdict"] not in ("free", "risky"):
            continue
        for zone in ("com.au", "au"):
            if row["domains"][zone] != "free?" or asked >= budget:
                continue
            if asked:
                time.sleep(WHOIS_GAP)
            asked += 1
            answer = whois_au(f"{row['label']}.{zone}")
            if answer is None:
                print("auDA whois stopped answering, try --confirm later", file=sys.stderr)
                return
            row["domains"][zone] = answer
        row["verdict"], row["why"] = verdict(row)


def table(rows):
    lines = [
        "| Name | .com | .com.au | .au | ABN | Trade marks | Verdict | Why |",
        "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ]
    for row in rows:
        abr, tm, d = row["abr"], row["trade_marks"], row["domains"]
        abr_cell = abr if isinstance(abr, str) else (f"{len(abr['exact'])} same, {abr['similar']} similar")
        tm_cell = tm if isinstance(tm, str) else (f"{len(tm['exact'])} same, {tm['similar']} similar")
        lines.append(
            f"| {row['name']} | {d['com']} | {d['com.au']} | {d['au']} "
            f"| {abr_cell} | {tm_cell} | {row['verdict']} | {row['why']} |"
        )
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("names", nargs="*")
    parser.add_argument("--file", help="one name per line")
    parser.add_argument("--json", action="store_true", help="print JSON, not a table")
    parser.add_argument("--workers", type=int, default=6, help="names checked at once")
    parser.add_argument("--confirm", type=int, default=10, help="whois lookups to confirm free .au names, 0 for none")
    args = parser.parse_args()

    names = list(args.names)
    if args.file:
        with open(args.file, encoding="utf-8") as handle:
            names += [line.strip() for line in handle]
    names = list(dict.fromkeys(n for n in names if n.strip() and label_of(n)))
    if not names:
        parser.error("give at least one name")

    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        rows = list(pool.map(check, names))
    order = {"free": 0, "risky": 1, "unknown": 2, "taken": 3}
    rows.sort(key=lambda r: (order[r["verdict"]], r["why"].count(";"), r["name"].lower()))
    confirm(rows, args.confirm)
    rows.sort(key=lambda r: (order[r["verdict"]], r["why"].count(";"), r["name"].lower()))

    if args.json:
        json.dump(rows, sys.stdout, ensure_ascii=False, indent=2)
        print()
    else:
        print(table(rows))


if __name__ == "__main__":
    main()
