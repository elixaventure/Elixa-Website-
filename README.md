# Elixa Renewables Group — Website

A premium, production-grade marketing site for **Elixa Renewables Group Ltd** — a
nationwide UK renewable energy, heating, cooling and low-carbon technology company.

> **Powering a Smarter, Greener Future.**

Built to feel like a high-end energy-technology brand (Apple × Tesla Energy), not a
generic installer site: cinematic, fast, accessible and conversion-focused.

---

## Tech stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** design system (navy + green→cyan gradient tokens)
- **Framer Motion** — scroll reveals, transitions, micro-interactions
- **React Three Fiber / three.js** — the interactive 3D smart-energy home
- **Static export** (`output: "export"`) → deploy anywhere, no server needed

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to ./out
```

Serve the production build locally:

```bash
npx serve out
```

## Deployment

`npm run build` emits a fully static site to `./out`. Deploy to any static host —
**Vercel**, **Netlify**, **Cloudflare Pages**, GitHub Pages or S3/CloudFront.
No runtime, no database. Set the canonical domain in `content/site.ts` (`url`).

---

## What's included

| Deliverable | Status |
|---|---|
| Homepage (hero, services, 3D home, energy flow, why, process, calculator, grants, reviews, CTA) | ✅ |
| Service pages — Solar, Battery, Heat Pumps, Air Conditioning, ThermaSkirt, Underfloor, EV | ✅ |
| Interactive **3D smart-energy home** (hotspots + AC cooling/heating toggle + fallback) | ✅ |
| Scroll-driven **energy-flow** visualisation | ✅ |
| **Multi-step quote** journey (6 steps, AC-specific questions) | ✅ |
| **Energy savings calculator** (indicative, lead-gen) | ✅ |
| Grants & Funding, Projects (filter + before/after), About, Contact | ✅ |
| Legal pages (Privacy, Cookie, Terms) — **outline placeholders** | ✅ (needs final copy) |
| SEO — metadata, canonical, OG, JSON-LD (Organization, LocalBusiness, Service, FAQ, Breadcrumb), `sitemap.xml`, `robots.txt` | ✅ |
| Analytics/conversion scaffolding (GA4 + GTM, event helpers) | ✅ (add container ID) |
| Accessibility — semantic HTML, focus states, skip link, reduced-motion | ✅ |
| Performance — static export, lazy 3D, code-split, GPU-friendly animation | ✅ |
| Mobile experience — dedicated nav drawer + persistent Call/Quote bottom bar | ✅ |

## Project structure

```
app/                     # Routes (App Router). One folder per page.
  layout.tsx             # Shell: nav, footer, mobile bar, global JSON-LD
  page.tsx               # Homepage composition
  <service>/page.tsx     # 7 service pages (data-driven template)
  quote/ calculator/ …   # Lead-gen + content pages
  sitemap.ts robots.ts   # Generated at build
components/
  layout/  ui/  home/  page/  quote/  calculator/  projects/  brand/  seo/
content/                 # ← THE CMS SEAM (edit these)
  site.ts                # NAP, nav, CTAs
  services.ts            # All service copy, capabilities, FAQs
  site-content.ts        # Why-us, process, accreditations, grants, testimonials
  projects.ts            # Case studies
lib/                     # seo.ts (schema), analytics.ts, cn.ts
public/                  # favicon + (add) images, og.png, brand/
```

## Editing content (CMS)

All copy lives in typed modules under **`content/`** — this is the CMS seam. Edit a
file and the UI updates. To move to a headless CMS (Sanity/Contentful/Payload),
replace these modules with a fetch returning the same shapes; components don't change.

- **Services** → `content/services.ts`
- **Projects / case studies** → `content/projects.ts`
- **Grants, why-us, process, accreditations, testimonials** → `content/site-content.ts`
- **Company details, nav, contact** → `content/site.ts`

## Analytics

Set environment variables to activate tracking (leave unset to ship silent):

```
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

Conversion events are pushed via `lib/analytics.ts` → `track(...)`:
`quote_start`, `quote_step`, `quote_submit`, `calculator_complete`, `phone_click`,
`email_click`, `cta_click`. **For UK PECR/GDPR**, gate GTM/GA behind a cookie-consent
banner (Consent Mode "denied" by default) before go-live.

## Forms

The site is statically exported, so the quote wizard and contact form currently
hand off to the visitor's email client (`mailto:` to `info@elixarenewables.co.uk`).
For server-side capture/CRM, point them at Formspree, Netlify Forms, or an API route
(the latter requires switching off static export or adding a serverless function).

---

## ⚠️ Before you publish — what Elixa must supply

This build uses clearly-labelled placeholders where real assets/approvals are needed.
Please provide the following, and confirm entitlement before any mark is displayed:

1. **Official logo** — the flame mark in `components/brand/Logo.tsx` is an on-brand
   **stand-in**. Drop the official vector at `public/brand/elixa-logo.svg` and swap it in.
2. **Photography** — hero, service and project images. Replace the graphic
   placeholders (`Hero`, `ProjectsGallery`, service `heroImage` paths). Use authorised,
   photorealistic imagery; genuine product imagery where manufacturers are shown.
3. **Accreditations** — MCS, Gas Safe, SafeContractor, ThermaSkirt, F-Gas. Only shown
   once you set `supplied: true` + `asset` in `content/site-content.ts`. **No numbers,
   memberships or marks are fabricated.**
4. **Reviews** — `testimonials` is intentionally empty. Add genuine, consented quotes
   or wire a Google/Trustpilot integration. **Reviews are never invented.**
5. **Grants/funding figures** — kept general and disclaimer-guarded. Do not hard-code
   specific amounts as permanent copy; keep them current in `content/site-content.ts`.
6. **Legal copy** — Privacy, Cookie and Terms pages are outline placeholders; replace
   with final, legally-reviewed content.
7. **Analytics container** + **cookie-consent** banner.
8. `public/og.png` (1200×630) social share image, and the production domain in
   `content/site.ts`.

## Suggested next enhancements

- Real photography + official logo/accreditation assets (above)
- Cookie-consent banner with Google Consent Mode
- Server-backed form capture (Formspree/CRM/API route)
- Individual project detail pages and a blog/advice section (MDX)
- Optional: upgrade the 3D scene to a modelled property (GLTF) once photography exists
