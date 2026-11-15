# Rudransh Singh — Portfolio

A hand-built, dependency-free portfolio for **Rudransh Singh**, based on his software engineering résumé. Designed as a warm editorial site in black, white, and tan — with a playable Smooth Snake demo.

**Live site:** https://flamekaiser2201.github.io/rudransh-portfolio/

## What's inside

- Responsive single-page portfolio: hero, about, selected work, skills, education, certifications, contact.
- Light / dark theme with saved preference and system fallback.
- Accessible mobile navigation, scroll reveals, active-section navigation, reading progress.
- Copy-to-clipboard email, downloadable résumé, SEO / Open Graph metadata, custom 404.
- **Smooth Snake** demo built in vanilla JS — smooth interpolated movement, keyboard + touch controls, pause/restart, persistent best score.
- Project case studies link to the source repos:
  - [AETHER](https://github.com/FlameKaiser2201/aether-ai) — voice-first AI workspace (FastAPI · Next.js · PostgreSQL)
  - [Smooth Snake](https://github.com/FlameKaiser2201/snake-game) — Pygame desktop game + Flask browser build
- Self-hosted fonts (Instrument Serif, Manrope, JetBrains Mono) — no external runtime dependencies.
- No build step. Plain HTML, CSS, and JavaScript.

## Structure

```text
.
├── index.html
├── 404.html
├── assets/
│   ├── css/fonts.css        # self-hosted @font-face rules
│   ├── css/style.css        # design system + layout
│   ├── fonts/               # woff2 files
│   ├── img/favicon.svg
│   ├── img/og.png           # 1200×630 social preview
│   ├── js/main.js           # interactions + Snake game
│   └── resume/Rudransh-Singh-CV.pdf
├── robots.txt
├── sitemap.xml
└── .nojekyll                # tells GitHub Pages to skip Jekyll
```

## Preview locally (optional)

The site is static, so it also works by opening `index.html` directly. For a local server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`. The public site is deployed on GitHub Pages, not localhost.

## Deployment

The live site is served by **GitHub Pages** from the `main` branch, repository root:

- Repository: `FlameKaiser2201/rudransh-portfolio`
- URL: `https://flamekaiser2201.github.io/rudransh-portfolio/`

The 404 page uses absolute `/rudransh-portfolio/...` paths because GitHub Pages serves it for arbitrary deep links. If the repository is renamed, update those paths as well as the canonical/Open Graph URLs in `index.html`, `sitemap.xml`, and `robots.txt`.

## Editing

- Copy and sections live in `index.html`.
- The palette, type, spacing, and components are driven by CSS custom properties at the top of `assets/css/style.css`.
- Replace `assets/resume/Rudransh-Singh-CV.pdf` to update the downloadable CV.
- Email / phone / GitHub links appear in the hero contact panel and footer — search for them in `index.html`.

## Credits

Typefaces: [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif), [Manrope](https://fonts.google.com/specimen/Manrope), and [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono), all under the SIL Open Font License and self-hosted here.
