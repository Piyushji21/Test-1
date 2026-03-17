# Test-1

## Novel static site

Website files are in `novel-static-site/`.

- Reader homepage: `novel-static-site/index.html`
- Admin panel: `novel-static-site/admin.html`
- PHP uploader (InfinityFree-compatible): `novel-static-site/upload.php`
- Chapter manifest file: `novel-static-site/data/chapters.json`

## How the admin panel now works

1. Open `admin.html` on your hosted domain.
2. Enter admin password (`novel123`) in the form.
3. Fill chapter number/title (slug optional).
4. Upload `.txt`/`.html` file or paste content.
5. Click **Submit Chapter**.
6. `upload.php` saves the chapter as `novel-static-site/chapters/<slug>.html` on hosting.
7. `upload.php` updates `novel-static-site/data/chapters.json` so the homepage list updates automatically.

## Hosting note

This direct upload flow needs PHP hosting (like InfinityFree). Pure static hosting will not execute `upload.php`.

## Reader customization features

- Chapter pages now include a mobile-friendly settings panel with **Term / Text / Reader** tabs.
- Reader tab supports custom background + text colors, font family, font size, and line-height controls.
- Reader display preferences are saved in browser local storage and reused when opening chapter pages again.

- Added advanced chapter reader controls inspired by WTR-LAB: display options, text/term tabs, and term editor sections.
- Excluded translation mode switcher, AI translation gate, and Google translate fallback links as requested.
