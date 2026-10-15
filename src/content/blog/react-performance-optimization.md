Most React performance optimization advice is either too generic ("use memo!") or aimed at problems you don't have yet. These are the nine techniques I actually reach for, roughly in the order I apply them, along with how I decide whether each one is worth doing.

## 1. Measure before you change anything

Guessing at performance problems wastes time. I start with two tools:

- **React DevTools Profiler.** Record an interaction, then look at which components rendered, how long each took, and why. Turn on "Record why each component rendered while profiling" in the settings. It tells you whether a render came from a prop change, state change, or parent render.
- **Lighthouse and the Chrome Performance panel.** Lighthouse gives you a load-time picture (LCP, CLS, Total Blocking Time). The Performance panel shows long tasks and what's running during a slow interaction, which is what INP measures.

Always profile a **production build**. Development mode adds extra checks and double-renders in Strict Mode, so it's much slower than what users get.

```bash
npm run build && npm run preview
```

## 2. Split code by route with lazy and Suspense

If your whole app ships as one bundle, users download the admin dashboard just to read the homepage. Route-level splitting is the easiest win:

```jsx
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router";

const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings = lazy(() => import("./pages/Settings"));

export function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

Also lazy-load heavy components that aren't visible right away: chart libraries, rich text editors, map widgets, modals.

## 3. Virtualize long lists

Rendering 5,000 table rows means 5,000 sets of DOM nodes, even though only about 20 fit on screen. Virtualization renders just the visible rows plus a small buffer. I use TanStack Virtual:

```jsx
import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

export function OrderList({ orders }) {
  const parentRef = useRef(null);
  const virtualizer = useVirtualizer({
    count: orders.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 8,
  });

  return (
    <div ref={parentRef} style={{ height: 600, overflow: "auto" }}>
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((item) => (
          <div
            key={orders[item.index].id}
            style={{
              position: "absolute",
              top: 0,
              width: "100%",
              height: item.size,
              transform: `translateY(${item.start}px)`,
            }}
          >
            <OrderRow order={orders[item.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

If the list is under a few hundred simple rows, pagination or plain rendering is often fine. Measure first.

## 4. Avoid unnecessary re-renders

### Colocate state

The most effective fix is structural. If a search input's state lives in a top-level component, every keystroke re-renders the whole page. Move the state down into the component that uses it, or split the expensive part into a sibling that doesn't depend on that state.

Another pattern that helps: pass expensive subtrees as `children`. A component that holds frequently changing state won't re-render the `children` it was given, because those elements were created by the parent.

### Use memo, useMemo, and useCallback deliberately

These tools help in specific cases:

- `memo` on a component that's expensive to render and often receives the same props.
- `useMemo` for a costly calculation (sorting or filtering a large array) or to keep an object reference stable when it's passed to a memoized child.
- `useCallback` when a function is passed to a memoized child or used in an effect's dependency array.

Wrapping everything adds noise and its own overhead, and a single unstable prop cancels the benefit.

### Let the React Compiler handle it

The React Compiler is now stable and memoizes components and values automatically at build time. On new projects I turn it on and stop writing most manual memoization:

```bash
npm install -D babel-plugin-react-compiler
```

```js
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      babel: { plugins: ["babel-plugin-react-compiler"] },
    }),
  ],
});
```

It relies on your code following the Rules of React (pure render functions, no mutating props or state). The ESLint plugin `eslint-plugin-react-hooks` flags code it can't optimize. Next.js has a built-in `reactCompiler` option in `next.config`.

## 5. Optimize images

Images are often the largest part of a page and usually the LCP element. My checklist:

- Serve modern formats (WebP or AVIF) at the size they're displayed, using `srcset` and `sizes`.
- Set `width` and `height` so the browser reserves space and nothing shifts.
- Add `loading="lazy"` to images below the fold, but **never** to the LCP image.
- Add `fetchPriority="high"` to the hero image.

In Next.js, `next/image` handles most of this. Use `priority` on the hero image.

## 6. Debounce expensive work triggered by input

If every keystroke fires an API call or filters a huge dataset, debounce it:

```js
import { useEffect, useState } from "react";

export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
```

Use the debounced value for the fetch and keep the raw value for the input, so typing still feels instant. Also cancel stale requests with `AbortController` so an older response can't overwrite a newer one.

## 7. Keep input responsive with useTransition and useDeferredValue

Debouncing delays work. Transitions let React interrupt it instead. This directly improves INP, because the browser can paint the keystroke before the expensive update finishes.

```jsx
import { useDeferredValue, useState, memo } from "react";

export function ProductSearch({ products }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <div style={{ opacity: isStale ? 0.6 : 1 }}>
        <ResultList products={products} query={deferredQuery} />
      </div>
    </>
  );
}

const ResultList = memo(function ResultList({ products, query }) {
  const q = query.toLowerCase();
  const filtered = products.filter((p) => p.name.toLowerCase().includes(q));
  return filtered.map((p) => <ProductCard key={p.id} product={p} />);
});
```

Use `useTransition` when you control the state update (for example, switching tabs: `startTransition(() => setTab(next))`). Use `useDeferredValue` when you receive a value and want a lagging copy of it. Note that `ResultList` is memoized, which is what lets React skip it during the urgent render.

## 8. Analyze your bundle

You can't trim what you can't see. With Vite I use `rollup-plugin-visualizer`:

```js
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [react(), visualizer({ open: true, gzipSize: true })],
});
```

Things I commonly find: a full date library imported for one function, an icon package imported in a way that isn't tree-shaken, or a heavy dependency pulled into the main chunk by a single shared import. For Next.js, `@next/bundle-analyzer` does the same job.

## 9. Fetch data on the server where you can

Client-side fetching creates a waterfall: download JS, run React, start fetching, then render content. For pages where content matters (marketing pages, product pages, dashboards' first view), fetching on the server removes that wait.

In the Next.js App Router, Server Components can fetch directly:

```tsx
// app/products/page.tsx
export default async function ProductsPage() {
  const products = await getProducts();
  return <ProductGrid products={products} />;
}
```

In a client-only app, at least start requests early, using route loaders (React Router) or a data library like TanStack Query with prefetching, rather than in a `useEffect` deep inside the tree.

## FAQ

### Should I wrap every component in React.memo?

No. `memo` only helps when a component re-renders often with the same props and its render is expensive. Otherwise it adds comparison overhead and clutter. If you use the React Compiler, it handles memoization for you.

### Does the React Compiler replace useMemo and useCallback?

For most code, yes. It inserts memoization automatically where it's safe. You may still use them for things like keeping a stable effect dependency, but you'll write them far less often.

### How do I improve INP in a React app?

Find the slow interaction in the Chrome Performance panel, then reduce the work it triggers. Move state closer to where it's used, mark non-urgent updates with `useTransition` or `useDeferredValue`, virtualize large lists, and break up long-running JavaScript.

If your React app feels slow and you're not sure where to start, [get in touch](/contact). Performance audits and fixes are part of [my services](/services).
