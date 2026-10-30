# Sizes each place takes

Check the Play Console help page when an upload fails. Google changes these
limits now and then.

## Google Play

| Asset             | Size                                                 | Format                         | Count   |
| ----------------- | ---------------------------------------------------- | ------------------------------ | ------- |
| App icon          | 512 × 512                                            | 32-bit PNG, up to 1 MB         | 1       |
| Feature graphic   | 1024 × 500                                           | JPEG or 24-bit PNG, no alpha   | 1       |
| Phone screenshots | each side 320 to 3840, long side up to 2 × the short | JPEG or 24-bit PNG, up to 8 MB | 2 to 8  |
| 7 inch tablet     | each side 320 to 3840                                | JPEG or 24-bit PNG             | up to 8 |
| 10 inch tablet    | each side 1080 to 7680                               | JPEG or 24-bit PNG             | up to 8 |
| Promo video       | YouTube link                                         | public or unlisted, ads off    | 1       |

- **Featured** Play shows the app in more lists with 4 or more phone shots
  at 9:16, at least 1080 px on the short side, such as 1080 × 1920.
- **Tall phones** a 1080 × 2400 shot is over 2:1 and fails. Pad or crop it
  to 1080 × 1920 on the app background.
- **Alpha** a PNG with a transparent layer fails the feature graphic and the
  shots. Flatten it on the app background.
- **Text** the feature graphic MAY carry the app name. Play shows it under a
  play button when a video is linked, so keep the middle clear.

## The site and link previews

| Asset            | Size                                     |
| ---------------- | ---------------------------------------- |
| `og:image`       | 1200 × 630 PNG or JPEG                   |
| Favicon          | 32 × 32 PNG, plus the SVG                |
| Apple touch icon | 180 × 180 PNG                            |
| PWA icons        | 192 and 512 PNG, plus a 512 maskable one |

## Other places

| Place                 | Size                                   |
| --------------------- | -------------------------------------- |
| GitHub social preview | 1280 × 640 PNG, under 1 MB             |
| VS Code Marketplace   | 128 × 128 PNG, no SVG                  |
| Windows `.ico`        | 16, 24, 32, 48, 64 and 256 in one file |
