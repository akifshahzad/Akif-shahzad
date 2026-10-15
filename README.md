# Akif Shahzad — Portfolio

A production-ready personal portfolio built with React, Vite, and Tailwind CSS, themed as a
code-editor: file-tab navigation, syntax-color accents, and a JSON "profile card" in the hero.

## Tech stack

- **React 19** + **Vite** — app shell and build tooling
- **Tailwind CSS v4** — styling, via `@tailwindcss/vite`
- **React Router** — client-side routing across 10 pages
- **Framer Motion** — scroll reveals, page transitions, hover and typing effects
- **React Icons** — technology and UI icons
- **React Hook Form** — contact form validation
- **EmailJS** — contact form delivery (no backend required)
- **React Helmet Async** — per-page SEO meta tags

## Project structure

```
src/
  components/
    layout/      Navbar, Footer
    sections/    Hero, FeaturedProjects, SkillsPreview, CTASection, ContactForm
    ui/          Button, Reveal, SectionHeading, ProjectCard, SkillBar, StatCard, Seo, TypingText
  layouts/       MainLayout (nav + footer + page-transition wrapper)
  pages/         Home, About, Skills, Projects, Experience, Services, Certifications, Resume, Contact, NotFound
  hooks/         useTheme, useActiveSection, useScrollToTop
  data/          skills.js, projects.js, experience.js (services + certifications + timeline)
  constants/     site-wide config (name, socials, nav links)
  utils/         cn.js (className join helper)
public/
  projects/      placeholder project preview SVGs — swap for real screenshots
  resume-akif-shahzad.pdf   placeholder résumé — replace with your own
  og-image.png   placeholder social-share image — replace with your own
  robots.txt, sitemap.xml, favicon.svg
```

## Getting started

```bash
npm install
npm run dev       # start local dev server
npm run build     # production build to dist/
npm run preview   # preview the production build locally
npm run lint      # oxlint
```

## Advanced features

- **AI-style chatbot** (`components/ui/Chatbot.jsx`, `data/chatbotFaqs.js`) — a floating,
  keyword-matched FAQ widget. No API key or backend; swap `getReply()` for a real LLM call if
  you want it wired to an actual model later.
- **GitHub contribution graph** (`components/ui/GithubContributions.jsx`) — on the About page,
  via the free `ghchart.rshah.org` image service. Update `githubUsername` in
  `src/constants/index.js`.
- **Visitor counter** (`components/ui/VisitorCounter.jsx`) — footer badge via
  `visitor-badge.laobi.icu`; fails silently (renders nothing) if the badge can't load.
- **Google Analytics 4** (`utils/analytics.js`) — loads only if `VITE_GA_MEASUREMENT_ID` is set;
  tracks page views on route change and a `resume_download` event from both résumé buttons.
- **Blog section** — `pages/Blog.jsx` (list) and `pages/BlogPost.jsx` (detail), content in
  `data/blog.js`. Add a post by adding an object to that array; no routing changes needed.
- **Multi-language support (English + Urdu)** — `i18n/LanguageContext.jsx` +
  `i18n/translations.js`. Covers nav, footer, and hero copy, switches `<html lang/dir>` for RTL,
  and swaps in Noto Nastaliq Urdu for body text. File-tab labels in the nav (`Home.jsx`, etc.)
  stay in English intentionally — they represent literal filenames in the editor motif. Extend
  `translations.js` with more keys to translate additional page copy.
- **Testimonials** (`components/sections/Testimonials.jsx`, `data/testimonials.js`) — shown on
  the homepage.
- **Advanced project filtering** — `pages/Projects.jsx` now supports free-text search combined
  with multi-select technology tags (AND logic), plus a live result count and "clear filters".
- **Route-level code splitting** — every page except Home is lazy-loaded via `React.lazy` +
  `Suspense` (see `App.jsx`), so the initial bundle only ships what the first paint needs.

## Environment variables (contact form)

The contact form uses [EmailJS](https://www.emailjs.com/docs/) so it can send email without a
backend. Copy `.env.example` to `.env` and fill in your own service, template, and public key:

```
VITE_EMAILJS_SERVICE_ID=service_xxx
VITE_EMAILJS_TEMPLATE_ID=template_xxx
VITE_EMAILJS_PUBLIC_KEY=public_xxx
```

Until these are set, the form still validates and submits, but shows a message explaining that
EmailJS isn't connected yet, instead of failing silently.

## Content to personalize before shipping

- `src/constants/index.js` — name, email, phone, socials, résumé path
- `src/data/skills.js`, `projects.js`, `experience.js` — your real projects, stack, and history
- `public/resume-akif-shahzad.pdf` — replace with your actual résumé
- `public/og-image.png` — replace with a real social-preview image
- `public/projects/*.svg` — replace with real project screenshots
- Update the canonical domain (`akif-shahzad.vercel.app`) in `index.html`, `src/components/ui/Seo.jsx`,
  `public/robots.txt`, and `public/sitemap.xml` to your actual domain once deployed

## Deployment (Vercel)

1. Push this project to a GitHub repository.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Framework preset: **Vite**. Build command `npm run build`, output directory `dist` (Vercel
   detects these automatically).
4. Add the `VITE_EMAILJS_*` environment variables in the Vercel project settings.
5. Deploy. `vercel.json` is already included so client-side routes (e.g. `/projects`) resolve
   correctly on refresh/direct link.

## Accessibility & performance notes

- Skip-to-content link, visible focus rings, and `aria-*` attributes on nav, forms, and progress
  bars are already in place.
- Animations respect `prefers-reduced-motion`.
- Images use `loading="lazy"`; icons are inline SVG (no extra network requests).
- Run `npm run build && npm run preview`, then audit with Lighthouse before deploying to catch
  anything specific to your final content and images.
