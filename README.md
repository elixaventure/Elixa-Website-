# Elixa Renewables — Website

A modern, fast, single-page marketing site for **Elixa Renewables**, MCS-accredited
installers of air source heat pumps, underfloor heating and ThermaSkirt skirting heating.

## Highlights

- **Interactive 3D hero** — a WebGL "clean energy" sphere (Three.js) with orbiting
  particles drawn inward toward a glowing core, plus pointer parallax. Loads as a
  progressive enhancement: if WebGL or the CDN is unavailable, a polished CSS gradient
  hero shows instead.
- **Easy-to-use UI** — sticky glass navigation, a slide-in mobile menu, smooth-scroll
  section links, scroll-reveal animations, animated count-up statistics, subtle 3D
  tilt on cards, and an accessible enquiry form.
- **Responsive** from large desktops down to small phones.
- **Accessible & considerate** — respects `prefers-reduced-motion`, pauses the 3D
  scene when off-screen to save battery, and uses semantic HTML with ARIA labels.

## Structure

```
.
├── index.html        # Page markup & content
├── css/styles.css    # Design system + layout
├── js/
│   ├── hero3d.js     # Three.js 3D hero (ES module)
│   └── main.js       # Nav, scroll reveals, count-ups, tilt, form
└── assets/
    └── favicon.svg
```

## Running locally

It's a static site — no build step. Serve the folder with any static server:

```bash
# Python
python3 -m http.server 8000
# or Node
npx serve .
```

Then open <http://localhost:8000>. (Open via a server, not `file://`, so the ES-module
`importmap` for Three.js resolves.)

## Deploying

Push to any static host — **GitHub Pages**, Netlify, Vercel, Cloudflare Pages. For
GitHub Pages, enable Pages on the branch root and the site is live.

## Dependencies

- [Three.js](https://threejs.org/) `0.160.0` via `unpkg` CDN (import map).
- Google Fonts (Sora + Inter) via CDN.

Both are optional enhancements — the site remains fully usable with system fonts and
the CSS hero if the CDNs are blocked.

## Notes

The enquiry form has no backend; on submit it opens the visitor's email client
pre-filled to `joshua@elixarenewables.co.uk`. To collect submissions server-side,
point the form at a handler such as Formspree, Netlify Forms, or your own endpoint.
