React SEO has a reputation for being hard, and with a client-rendered single-page app it does take some deliberate work. Google can index JavaScript sites, but it needs clear signals: a unique title and description per route, crawlable links, a sitemap, and content that shows up quickly. Here's the checklist I follow when an SPA needs to rank.

## How Google handles JavaScript

Googlebot crawls a URL, queues it for rendering, then renders the page in an up-to-date headless Chromium and indexes the result. For a React SPA this means:

- **Google will usually see your content**, but only after rendering, which can happen later than the initial crawl.
- **Anything that needs a click, scroll, or login to appear won't get indexed.** Content must render on page load.
- **Links must be real `a` elements with an `href`.** A `div` with an `onClick` that calls `navigate()` isn't a link to a crawler. React Router's `Link` renders a proper anchor, so use it.
- **Social crawlers don't run JavaScript.** Facebook, LinkedIn, X, Slack, and WhatsApp read the raw HTML. If your Open Graph tags are only injected client-side, link previews will show your fallback `index.html` tags. This is the strongest argument for prerendering.

## Per-route titles and meta tags

Every route needs its own title and meta description. In a Vite + React app I use `react-helmet-async`.

```jsx
// main.jsx
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
```

Then I wrap it in a small `Seo` component so every page uses the same pattern:

```jsx
import { Helmet } from "react-helmet-async";

const SITE_URL = "https://example.com";

export function Seo({ title, description, path, image = "/og-default.png" }) {
  const url = `${SITE_URL}${path}`;
  return (
    <Helmet>
      <title>{`${title} | Example`}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={`${SITE_URL}${image}`} />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
}
```

React 19 can also hoist `title`, `meta`, and `link` elements rendered anywhere in the tree into the document head, without any library. That works well for simple cases. I still use a helmet-style wrapper when I need deduplication across nested routes.

## Canonical URLs

A canonical tag tells Google which URL is the main version of a page. SPAs often serve the same content at several URLs (`/blog/post`, `/blog/post/`, `/blog/post?ref=x`), so set an absolute canonical on every route, as in the `Seo` component above. Make sure it points to the URL you actually want indexed, with consistent trailing slashes.

## sitemap.xml and robots.txt

Put both in `public/` so Vite copies them to the build output.

```bash
# public/robots.txt
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml
```

For a small site a hand-written sitemap is fine. For a blog or anything with dynamic routes, I generate it at build time with a short Node script that reads the content folder and writes `dist/sitemap.xml`. List only canonical, indexable URLs.

## JSON-LD structured data

Structured data helps Google understand what a page is about and can make it eligible for rich results. For a blog post I add `BlogPosting`:

```jsx
<Helmet>
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      author: { "@type": "Person", name: "Akif Shahzad" },
      mainEntityOfPage: `https://example.com/blog/${post.slug}`,
    })}
  </script>
</Helmet>
```

Check it with Google's Rich Results Test before shipping.

## SPA rewrites on Vercel

Without a rewrite, refreshing `/blog/my-post` on a static host returns a 404, because there's no file at that path. On Vercel, add a `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Vercel serves real files (like `sitemap.xml` and assets) before applying rewrites, so those still work. One catch: unknown URLs now return `200` with your app shell. Render a clear "not found" page with `meta name="robots" content="noindex"` for unmatched routes so Google doesn't index soft 404s.

## Prerendering and static generation

Prerendering produces real HTML for each route at build time, so crawlers (including social ones) get content and meta tags without running JavaScript. Options I've used or evaluated:

- **React Router framework mode** has a `prerender` option in `react-router.config.ts` that outputs static HTML for the routes you list.
- **Vite prerender plugins** that render routes in a headless browser after the build.
- **Astro**, if the site is mostly content and React is only needed for a few interactive pieces.

```ts
// react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,
  async prerender() {
    return ["/", "/about", "/blog", "/blog/react-seo-single-page-app"];
  },
} satisfies Config;
```

## When to move to Next.js

I recommend switching to Next.js (or another SSR framework) when:

- Organic search is a main acquisition channel.
- You have many dynamic pages, like products, listings, or user profiles, that change too often to prerender at build time.
- You need per-page Open Graph images and metadata generated from data.

With the App Router, metadata lives next to the page and renders on the server:

```ts
// app/blog/[slug]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: { title: post.title, description: post.excerpt, type: "article" },
  };
}
```

For static pages, a plain `export const metadata = { ... }` is enough.

## Core Web Vitals

Page experience is a ranking signal, and the three Core Web Vitals are **LCP** (loading), **INP** (responsiveness), and **CLS** (visual stability). SPAs tend to struggle with LCP because the main content waits for the JS bundle, then for an API call. Code-split routes, prioritise the hero image, and avoid fetching above-the-fold content on the client when you can. My [pre-launch Lighthouse checklist](/blog/lighthouse-90-checklist) and [React performance techniques](/blog/react-performance-optimization) go deeper.

## Google Search Console

Once the site is live:

1. Verify the domain in Search Console.
2. Submit your sitemap.
3. Use **URL Inspection** on a few key routes and check the rendered HTML and screenshot. This is the most direct way to confirm Google sees your content.
4. Watch the **Pages** report for "Crawled, currently not indexed" and soft 404s.
5. Check the **Core Web Vitals** report once you have enough real-user data.

## FAQ

### Can Google index a React single-page app?

Yes. Googlebot renders JavaScript with a modern Chromium, so client-rendered content can be indexed. Rendering can be delayed, though, and other crawlers and social previews don't run JavaScript. Prerendering or SSR makes indexing more reliable.

### Do I need Next.js for SEO?

Not always. A small marketing site or portfolio can rank well as a Vite SPA with per-route meta tags, a sitemap, and prerendering. Next.js becomes worth it when you have many dynamic, search-driven pages.

### Why do my link previews show the wrong title?

Social platforms read the raw HTML without running JavaScript, so they only see the tags in your static `index.html`. Prerender your routes or use server rendering so each URL ships its own Open Graph tags.

If your React app isn't showing up in search and you'd like a second pair of eyes, [get in touch](/contact). Technical SEO for React and Next.js is part of [my services](/services).
