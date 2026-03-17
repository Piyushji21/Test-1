# Test-1

## Static Novel Website

A complete static novel reading website is available in `novel-static-site/`.

- Reader homepage: `novel-static-site/index.html`
- Admin panel: `novel-static-site/admin.html`
- Sample chapter page: `novel-static-site/chapters/chapter-one.html`

## Admin usage

1. Open `admin.html`.
2. Enter password: `novel123`.
3. Add chapter number/title/slug.
4. Paste chapter content or upload a `.txt`/`.html` file.
5. Click **Generate Chapter** and then **Download .html**.
6. Place downloaded file in `novel-static-site/chapters/`.
7. Deploy static files.

### Optional chapter list sync

- Admin saves chapter metadata to browser local storage.
- Use **Export** to download `chapters-manifest.json` and **Import** to load it on another device/browser.
