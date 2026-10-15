React vs Next.js is one of the first decisions on almost every frontend project I start, and the answer is rarely "always Next.js" or "always plain React". In this post I'll explain what each one actually is in 2026, how rendering, SEO, routing, data fetching and hosting differ, and give you a decision table I use with clients.

## What React and Next.js Actually Are

**React** is a UI library. It gives you components, state, hooks and (since React 19) features like Actions, `use()`, and native `<title>`/`<meta>` support inside components. It does not ship a router, a data layer, or a build tool. You pick those yourself, and in 2026 the default pick is **Vite** for the build, plus something like React Router or TanStack Router.

**Next.js** is a framework built on React. With the App Router, it gives you file-based routing, React Server Components (RSC), server-side rendering, static generation, Server Actions, API route handlers, image and font optimization, and a production build pipeline. You are still writing React, but inside a set of conventions that decide where code runs.

So the real comparison is not "React vs Next.js". It's **a client-rendered React app (usually Vite) vs a server-aware React framework (Next.js)**.

## Rendering: SPA vs SSR, SSG and RSC

This is the core difference, and almost every other point flows from it.

- **SPA (Vite + React):** the server sends a mostly empty HTML file and a JavaScript bundle. The browser downloads the JS, runs it, fetches data, then renders. Simple to reason about, simple to host.
- **SSR (Next.js):** HTML is rendered on the server per request, so the user sees content before JavaScript finishes loading.
- **SSG / static rendering (Next.js):** pages are rendered at build time (or revalidated periodically) and served as static files.
- **RSC (Next.js App Router):** components run on the server by default, can read from a database or API directly, and send no JavaScript to the browser unless you mark a component with `"use client"`.

Here is what server-side data fetching looks like in a Next.js Server Component:

```jsx
// app/posts/page.jsx
export const metadata = {
  title: "Posts",
  description: "Latest posts from the blog",
};

export default async function PostsPage() {
  const res = await fetch("https://api.example.com/posts", {
    next: { revalidate: 60 }, // re-fetch at most once a minute
  });
  const posts = await res.json();

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

And the equivalent in a Vite + React SPA, where the fetch happens in the browser:

```jsx
import { useEffect, useState } from "react";

export default function Posts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("https://api.example.com/posts", { signal: controller.signal })
      .then((res) => res.json())
      .then(setPosts)
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      });
    return () => controller.abort();
  }, []);

  return (
    <>
      <title>Posts</title>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </>
  );
}
```

In real SPAs I'd use TanStack Query instead of raw `useEffect`, but the point stands: in the SPA, nothing meaningful exists until the browser does the work.

## SEO: Where the Gap Is Real

Google can render JavaScript, but it's slower and less reliable than reading HTML directly, and many other crawlers and link-preview bots (social platforms, chat apps) don't run JS at all. If your page content and meta tags only exist after client-side rendering, you're taking a risk.

My honest take:

- **Marketing sites, blogs, landing pages, e-commerce listings, docs:** use Next.js (or another SSR/SSG option). Server-rendered HTML and per-page metadata matter here.
- **Dashboards, admin panels, internal tools, anything behind login:** SEO is irrelevant. A SPA is perfectly fine.

React 19's native `<title>` and `<meta>` support helps SPAs a little, but it doesn't fix the fact that the initial HTML is empty.

## Routing

Next.js uses the file system: `app/blog/[slug]/page.jsx` becomes `/blog/:slug`. Layouts, loading states (`loading.jsx`) and error boundaries (`error.jsx`) are conventions, not code you wire up. It's productive once you learn it, but it's opinionated.

With Vite + React you choose a router. React Router and TanStack Router are both solid, and TanStack Router has excellent type-safe params. You get more control and less magic.

## Data Fetching and Mutations

In Next.js, Server Components fetch data on the server, and **Server Actions** handle form submissions and mutations without writing a separate API endpoint. That's a big productivity gain for full-stack apps where the frontend and backend live together.

In a SPA, you call an API: your own Express or FastAPI backend, or a third-party service. That's more code, but it gives you a clean separation, which I actually prefer when the API also serves a mobile app or other clients.

## Hosting and Operations

| Concern | Vite + React (SPA) | Next.js (App Router) |
|---|---|---|
| Output | Static files (HTML, JS, CSS) | Node.js server, edge functions, or static export |
| Hosting | Any CDN or static host, S3, Nginx | Vercel, Netlify, or a Node server / Docker container |
| Server costs | Near zero for the frontend | You run (or pay for) compute |
| Complexity | Low | Medium: caching, server/client boundaries |
| Static export | Default | Possible with `output: "export"`, but loses SSR, Server Actions and more |

A SPA is just files. You can drop it on any CDN. Next.js with SSR needs a runtime. Self-hosting Next.js in Docker works fine (I do it), but you're now operating a server, and you need to understand its caching behavior.

## Decision Table

| Your project | My pick | Why |
|---|---|---|
| Marketing site, blog, portfolio | Next.js | SEO, fast first paint, per-page metadata |
| E-commerce storefront | Next.js | SEO on product pages, server-side data |
| SaaS with public pages + app | Next.js | One codebase for both |
| Admin dashboard / internal tool | Vite + React | No SEO needs, simpler hosting |
| App that only consumes an existing API | Vite + React | Backend already exists |
| Embedded widget or micro-frontend | Vite + React | Small, portable bundle |
| Learning React for the first time | Vite + React | Fewer concepts at once |
| Mobile + web sharing one API | Either, API-first | Keep business logic in the API |

## When Vite + React Is Still the Right Call

The React docs push frameworks, and for many projects that's good advice. But I still reach for Vite + React regularly, and here's when:

1. **Everything is behind a login.** No crawler will ever see it, so SSR buys you little.
2. **You already have a backend.** If your team runs a FastAPI or Express API, adding Next.js server code creates a second backend to maintain.
3. **You want boring hosting.** Static files on a CDN don't have cold starts, server bills, or cache invalidation surprises.
4. **The team is new to React.** Server vs client components, caching rules and the `"use client"` boundary are real cognitive load.

Next.js isn't "React but better". It's React plus a server, and a server is worth adding only when you'll use it.

## FAQ

### Is Next.js better than React?

They aren't competitors. Next.js uses React. Next.js is better for SEO-sensitive, content-heavy, or full-stack apps. A plain React SPA is often better for dashboards and internal tools where simplicity and cheap hosting matter more.

### Should I learn React before Next.js?

Yes. Learn components, props, state, hooks and effects in a Vite project first. Next.js adds server concepts on top, and they're much easier to understand once React itself feels natural.

### Is Create React App still used in 2026?

No. Create React App is deprecated. For a client-side React app, use Vite. For a framework, use Next.js or React Router in framework mode.

### Can I use Next.js without Vercel?

Yes. You can run `next build` and `next start` on any Node.js server, package it in a Docker container with `output: "standalone"`, or deploy to other platforms that support it. I cover containers in [Docker for web developers](/blog/docker-for-web-developers).

If you're deciding between React and Next.js for a real project and want a second opinion on the architecture, [get in touch](/contact). I'm happy to look at your requirements and recommend the simplest stack that will actually hold up.
