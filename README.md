# Jubair Hossain — Developer Portfolio

A premium, next-generation developer portfolio built with **Next.js 16**, **React 19**, **Tailwind CSS v4**, and **Framer Motion**. Dark/light themes, buttery scroll animations, glassmorphism, magnetic buttons, animated counters, a 3D-tilt project gallery, and a fully accessible, SEO-optimized, mobile-first experience.

---

## ✨ Features

- **12 polished sections** — Hero, About, Skills, Projects, Experience, Services, Certifications, Testimonials, GitHub activity, Blog, Contact, Footer.
- **Dark / light themes** with flash-free switching (`next-themes`) and system-preference support.
- **Premium motion** — section reveals, animated counters, magnetic buttons, 3D-tilt cards, parallax hero, rotating headline, infinite tech marquee, a bespoke preloader, and a scroll progress bar. All respect `prefers-reduced-motion`.
- **Responsive & mobile-first** — pixel-perfect from 320px to ultra-wide, with a full-screen mobile menu.
- **Accessible (WCAG-minded)** — semantic landmarks, skip link, focus-visible rings, ARIA labels, keyboard-friendly controls, labelled form fields with inline errors.
- **SEO ready** — rich metadata, Open Graph + Twitter cards, a generated OG image, `sitemap.xml`, `robots.txt`, JSON-LD (`Person`), a web manifest, and dynamic favicons.
- **Fast** — optimized images (`next/image`), lean bundles, static prerendering.
- **Maintainable** — every piece of copy lives in one file: [`content/site.ts`](content/site.ts).

## 🧱 Tech stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) · React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) |
| Animation | Framer Motion |
| Icons | lucide-react + custom brand SVGs |
| Theming | next-themes |

## 🚀 Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Build & run in production:

```bash
npm run build
npm run start
```

## ✏️ Customize your content

**All text and data live in [`content/site.ts`](content/site.ts).** Edit that one file to update the entire site. Sections marked `PLACEHOLDER` use sample content you should replace with your real details:

| What | Where | Status |
|---|---|---|
| Name, role, tagline, socials, email | `site` | ✅ Real |
| Featured projects | `projects` | ✅ Real (from your GitHub) |
| GitHub stats & languages | `github` | ✅ Real |
| Skills & proficiencies | `skillCategories` | ✏️ Tune to taste |
| **Experience / education** | `experience` | ⚠️ **Replace** (sample) |
| **Certifications** | `certifications` | ⚠️ **Replace** (sample) |
| **Testimonials** | `testimonials` | ⚠️ **Replace with real quotes** |
| **Blog posts** | `posts` | ⚠️ **Replace / link real articles** |

Other quick wins:

- **Résumé:** drop a `resume.pdf` into `public/` (the About button links to `/resume.pdf`).
- **Photo:** replace `public/jubair-portrait.jpg` / `.webp` (square, ~1000×1000).
- **Domain:** set `site.url` in `content/site.ts` to your deployed URL (used for canonical links, OG, sitemap).

## 📬 Contact form

The form posts to `app/api/contact/route.ts`. Out of the box it validates input and logs messages server-side. To actually **receive emails**, add a [Resend](https://resend.com) API key:

```bash
# .env.local
RESEND_API_KEY=re_xxxxxxxx
CONTACT_TO_EMAIL=jubu01754@gmail.com                  # where messages are delivered
CONTACT_FROM_EMAIL="Portfolio <you@yourdomain.com>"   # a verified Resend sender
```

Without a key, submissions succeed but are only logged (handy for local dev). See `.env.example`.

## 🌐 Deploy

Optimized for **Vercel** — push to GitHub and import the repo, or:

```bash
npm i -g vercel && vercel
```

Add the contact env vars in your host's dashboard. Any Node host works (`npm run build && npm run start`).

## 📁 Structure

```
app/                 App Router: layout, page, api, SEO routes, icons
components/
  layout/            Navbar, Footer, Preloader, ThemeToggle, ScrollProgress
  sections/          Hero, About, Skills, Projects, Experience, ...
  ui/                Reveal, Magnetic, Button, Counter, TiltCard, Section, Aurora
  providers/         ThemeProvider
  icons.tsx          Data-driven lucide map + brand SVGs
content/site.ts      ← all content lives here
lib/utils.ts         cn() helper
```

## ♿ Accessibility & performance notes

- Every animation is gated behind `prefers-reduced-motion`.
- Color tokens maintain contrast in both themes; focus states are always visible.
- Images are lazy-loaded and responsive; the hero image is prioritized for LCP.

---

Built with ❤️ using Next.js, Tailwind CSS, and Framer Motion.
