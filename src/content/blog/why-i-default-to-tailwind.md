Tailwind CSS is my default for styling new projects, and I know it isn't everyone's. Most of the criticism comes from codebases where utility classes were left to sprawl. In this post I explain why I still reach for Tailwind, how I keep it readable, and when I'd choose something else.

## Why utility classes get a bad reputation

Most people's first bad experience with Tailwind is a component like this:

```jsx
<button className="px-4 rounded-lg hover:bg-blue-700 text-white py-2 font-medium bg-blue-600 focus-visible:outline-2 disabled:opacity-50 text-sm inline-flex items-center gap-2">
```

Now imagine that exact string copied into 30 files, each with slight variations. That isn't a problem with utility CSS itself. It's the same problem as copy-pasting any code. The fix is the same as well: consistent conventions and extracting things once they repeat.

## What I get from Tailwind

- **Speed.** I style in the markup without switching files or inventing class names. For layout-heavy work like dashboards, forms, and landing pages, that's a real difference.
- **Constraints.** Spacing, colour, and type come from a scale, so I'm picking `p-4` or `p-6`, not typing `17px`. Designs stay consistent without a lot of discipline.
- **Local reasoning.** The styles for an element are on the element. When I delete a component, its styles go with it. No dead CSS left behind in a global stylesheet.
- **No specificity fights.** Utilities all have the same low specificity, so I don't end up adding `!important` to win.

## Tailwind v4 setup

Tailwind v4 moved configuration into CSS. There's no `tailwind.config.js` by default. With Vite, the setup is a plugin and one import:

```bash
npm install tailwindcss @tailwindcss/vite
```

```js
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

```css
/* src/index.css */
@import "tailwindcss";
```

Content detection is automatic, so you don't need to list your source files.

## Design tokens with @theme

Design tokens are where Tailwind starts to feel like a design system instead of a long list of classes. In v4 you define them with `@theme`, and each variable generates matching utilities:

```css
@import "tailwindcss";

@theme {
  --color-brand-50: oklch(0.97 0.02 250);
  --color-brand-500: oklch(0.6 0.18 250);
  --color-brand-700: oklch(0.45 0.16 250);

  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Space Grotesk", ui-sans-serif, sans-serif;

  --radius-card: 0.875rem;
}
```

Now `bg-brand-500`, `text-brand-700`, `font-display`, and `rounded-card` all exist. These are also normal CSS variables, so you can use `var(--color-brand-500)` in any custom CSS or inline style. I keep all tokens in this one block. If a colour isn't in `@theme`, it doesn't go in the UI.

## Keeping classes readable

### Sort classes automatically

Inconsistent class order is what makes long class strings hard to scan. The official Prettier plugin sorts them in a predictable order (layout, then spacing, then typography, and so on) every time you save.

```bash
npm install -D prettier prettier-plugin-tailwindcss
```

```json
{
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindStylesheet": "./src/index.css"
}
```

In v4, the `tailwindStylesheet` option points the plugin at your CSS entry so it knows about your custom theme. Once this runs everywhere, nobody argues about class order again.

### Extract components, not CSS

When a class combination repeats, I extract a **component**, not a CSS class. The component holds the styling and the behaviour together:

```tsx
import { cn } from "@/lib/cn";

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: "primary" | "ghost";
  size?: "sm" | "md";
};

const variants = {
  primary: "bg-brand-500 text-white hover:bg-brand-700",
  ghost: "bg-transparent text-brand-700 hover:bg-brand-50",
};

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-base",
};

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
```

Now the long class string exists in one place, and every other file writes `<Button variant="ghost">`.

### Use cn() for conditional classes

Template strings with ternaries get messy, and they create conflicts: if a component sets `px-4` and the caller passes `px-6`, which one wins depends on CSS order, not on the order in your string. A small `cn()` helper fixes both problems:

```ts
// src/lib/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

`clsx` handles conditionals (`cn("p-4", isActive && "bg-brand-50")`), and `tailwind-merge` removes conflicting utilities so the last one wins. That's why the `Button` above can safely accept a `className` override.

## Extract patterns once they're stable

I don't create a `Card` or `Badge` component on day one. Early in a project, the design is still changing, and abstracting too soon means fighting the abstraction later. My rule: once I've written the same combination about three times and it has stopped changing, I extract it. Until then, inline utilities are easier to change.

For the occasional case where a component isn't appropriate, such as styling Markdown output or third-party HTML, I use the typography plugin or a small block of plain CSS that uses the theme variables. v4 also has `@utility` for defining your own utilities when you need one.

## When I wouldn't use Tailwind

- **The team already has a working CSS approach.** If a codebase uses CSS Modules or a mature component library consistently, switching just adds churn.
- **Heavily content-driven pages** where most styling applies to HTML you don't control, like CMS output. Plain CSS (or the typography plugin) is a better fit.
- **A team that doesn't want it.** Tailwind works best when everyone agrees on the conventions above. Forcing it on people who dislike it leads to the messy codebases that gave it a bad name.
- **Very small static pages** where a few dozen lines of CSS do the job.

## FAQ

### Is Tailwind CSS v4 different from v3?

Yes, mainly in configuration. v4 is configured in CSS with `@import "tailwindcss";` and `@theme` instead of a JavaScript config file, detects content automatically, and has first-party plugins for Vite and PostCSS. Most utility class names are the same, though a few were renamed. The official upgrade tool handles most of the migration.

### Does Tailwind make HTML harder to read?

It can, if class strings are long, unsorted, and repeated. Automatic class sorting, extracting repeated patterns into components, and a `cn()` helper for conditionals keep it manageable.

### Should I use @apply in Tailwind?

Sparingly. It still works in v4, but using it everywhere brings back the problems of traditional CSS: naming things and tracking where styles live. I prefer extracting a component, and keep `@apply` for the rare spots where I can't control the markup.

If you're starting a project and want a clean Tailwind and React setup from the beginning, have a look at [my services](/services) or [get in touch](/contact).
