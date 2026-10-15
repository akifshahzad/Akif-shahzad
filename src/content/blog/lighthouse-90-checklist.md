Getting a 90+ Lighthouse score is mostly about not making a handful of common mistakes, rather than about clever tricks. This is the checklist I go through before launching a site, grouped by Lighthouse's four categories, plus the testing habits that keep the numbers honest.

## First: test the right build

Before any of the checklist, make sure you're measuring correctly. A dev server isn't optimised, so its scores tell you very little.

- Run Lighthouse on a **production build**, not `npm run dev`.
- Use an **incognito window**, so browser extensions don't inject scripts and skew the result.
- Run it **a few times** and look at the median. Single runs vary.
- Check the **mobile** preset. That's the one Lighthouse defaults to, and it's usually where problems show up.

```bash
npm run build && npm run preview
# then, in another terminal:
npx lighthouse http://localhost:4173 --view
```

Lab scores are a guide, not the goal. Once the site has traffic, the field data in Search Console and PageSpeed Insights shows what real users experience.

## Performance

### The LCP element

Largest Contentful Paint is usually the hero image or the main heading. It should be in the initial HTML and load as early as possible.

- The LCP element **isn't waiting on a client-side fetch**. If the hero text comes from an API called in `useEffect`, it can't paint until the JS loads, runs, and the request finishes. Put it in the HTML, prerender it, or fetch on the server.
- The LCP image has `fetchpriority="high"` and **no** `loading="lazy"`.
- If the LCP image is a CSS background or is discovered late, preload it.

```html
<img
  src="/images/hero-1200.webp"
  srcset="/images/hero-800.webp 800w, /images/hero-1200.webp 1200w"
  sizes="(max-width: 768px) 100vw, 1200px"
  width="1200"
  height="630"
  alt="Dashboard showing weekly focus sessions"
  fetchpriority="high"
/>
```

In JSX, the prop is `fetchPriority="high"`.

### Images

- Images are compressed and served as WebP or AVIF.
- Images are sized for their display size, with `srcset` and `sizes` for responsive layouts.
- Every below-the-fold image has `loading="lazy"`.
- Every image has `width` and `height` attributes (or a CSS `aspect-ratio`) so the browser reserves space. This prevents layout shift (CLS).

### Fonts

- Fonts are **self-hosted**, or you `preconnect` to the font host.
- `font-display: swap` is set, so text shows immediately in a fallback font.
- Only the weights and subsets you use are loaded. Prefer `woff2`.
- The main font file is preloaded if it's needed for above-the-fold text.

```css
@font-face {
  font-family: "Inter";
  src: url("/fonts/inter-var.woff2") format("woff2");
  font-weight: 100 900;
  font-display: swap;
}
```

```html
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin />
```

If you use Google Fonts directly, add `rel="preconnect"` for `https://fonts.googleapis.com` and `https://fonts.gstatic.com` (the second with `crossorigin`).

### JavaScript

- **Routes are code-split** with `lazy` and `Suspense`, so the homepage doesn't ship code for every page.
- Heavy components below the fold (charts, maps, editors) are lazy-loaded.
- Non-critical third-party scripts (analytics, chat widgets) use `defer` or `async`, or load after the page is interactive.
- No unused large dependencies. Check with a bundle analyzer.

```jsx
import { lazy, Suspense } from "react";

const Projects = lazy(() => import("./pages/Projects"));

<Suspense fallback={<PageSkeleton />}>
  <Projects />
</Suspense>
```

### Layout shift (CLS)

- Images, embeds, and ads have reserved space.
- Content isn't injected above existing content after load, such as banners that push the page down.
- Skeletons match the size of the content they replace.

### Responsiveness (INP)

Interaction to Next Paint replaced FID as the Core Web Vital for responsiveness. Lighthouse's default navigation run can't measure INP, since it doesn't click anything. It reports **Total Blocking Time** as a lab proxy. To keep INP healthy:

- No long tasks during load. Break up heavy work and defer non-critical scripts.
- Event handlers do the minimum synchronous work and update the UI first.
- Expensive React updates use `useTransition` or `useDeferredValue` so typing and clicks stay responsive.
- Large lists are virtualized.

For more on the React side, see [React performance techniques that actually matter](/blog/react-performance-optimization).

## Accessibility

Lighthouse's automated checks catch only a portion of accessibility issues, but they're the easy ones and they should all pass.

- Every image has meaningful `alt` text, or `alt=""` if it's decorative.
- Text has enough colour contrast against its background, including placeholder and disabled text.
- Every form input has a `label`.
- Buttons and links have accessible names. Icon-only buttons need an `aria-label`.
- The `html` element has a `lang` attribute.
- Headings go in order (`h1`, then `h2`, then `h3`) without skipping levels.
- Tap targets are big enough and not crowded together on mobile.

After Lighthouse passes, I also tab through the page with a keyboard to check focus order and visible focus styles.

## Best Practices

- The site is served over HTTPS with no mixed content.
- No errors in the browser console.
- No deprecated APIs or third-party cookies flagged.
- Images are displayed at the correct aspect ratio and at sufficient resolution.
- Source maps are available for large first-party JavaScript, if you're comfortable shipping them.

## SEO

- Every page has a unique `title` and meta description.
- Pages return the right HTTP status codes. Missing pages should return 404, not 200.
- Links are crawlable `a` elements with an `href`.
- `robots.txt` is valid and doesn't block important pages.
- There's a `meta name="viewport"` tag.
- Canonical URLs are set.

A good Lighthouse SEO score only means the basics are in place. For single-page apps there's more to do, which I cover in [React SEO for single-page apps](/blog/react-seo-single-page-app).

## FAQ

### Why is my Lighthouse score different every time?

Lighthouse runs on your machine, so network conditions, CPU load, and browser extensions all affect it. Test a production build in incognito, close other heavy apps, and use the median of several runs. PageSpeed Insights runs in a more consistent environment.

### Does Lighthouse measure INP?

Not in a standard page-load run, because no one interacts with the page. It reports Total Blocking Time as a lab stand-in. For real INP numbers, use the Chrome Performance panel while you interact with the page, or field data from Search Console and PageSpeed Insights.

### Is a 100 Lighthouse score necessary?

No. Getting from 90 to 100 often costs a lot of effort for little visible improvement. Above 90 on mobile, with good Core Web Vitals in field data, is a solid target for most sites.

If you're about to launch and want someone to go through this list with you, [get in touch](/contact). Performance and launch reviews are part of [my services](/services).
