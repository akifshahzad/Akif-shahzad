import { readingTime, stripMarkdown } from "../utils/markdown";

/**
 * Blog posts. Metadata lives here; the body of each post is a Markdown file
 * in src/content/blog/<slug>.md (supported syntax: see utils/markdown.js).
 *
 * To add a post: create the .md file, add an entry below, and add the URL
 * to public/sitemap.xml. Tags should come from BLOG_TOPICS so the topic
 * filter on /blog picks them up.
 */

/** "Most searched" topics shown as filters on the Blog page. */
export const BLOG_TOPICS = [
  "AI",
  "RAG",
  "LLM",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "Career",
  "Performance",
  "SEO",
  "Security",
  "DevOps",
  "CSS",
];

const POSTS_META = [
  {
    slug: "how-to-build-a-rag-chatbot-python",
    title: "How to Build a RAG Chatbot in Python (Step-by-Step)",
    date: "2026-10-15",
    featured: true,
    excerpt:
      "Build a RAG chatbot in Python step by step: chunking, embeddings, Chroma, retrieval, cited answers, a FastAPI endpoint, and a simple way to evaluate it.",
    tags: ["AI", "RAG", "Python", "LLM"],
    keywords: [
      "rag chatbot python",
      "retrieval augmented generation",
      "chroma vector database",
      "fastapi chatbot",
      "rag tutorial",
      "llm chatbot with citations",
      "evaluate rag",
    ],
  },
  {
    slug: "add-ai-chatbot-to-your-website",
    title: "How to Add an AI Chatbot to Your Website (Without Leaking Your API Key)",
    date: "2026-10-15",
    excerpt:
      "Add an AI chatbot to your website safely: a Vercel serverless function, a React chat UI, FAQ-grounded prompts, rate limiting and cost control.",
    tags: ["AI", "LLM", "React", "Security"],
    keywords: [
      "add ai chatbot to website",
      "ai chatbot api key security",
      "vercel serverless chatbot",
      "react chatbot",
      "anthropic node sdk",
      "chatbot rate limiting",
      "website faq chatbot",
    ],
  },
  {
    slug: "ai-agents-explained-tool-calling",
    title: "AI Agents Explained: How Tool Calling Actually Works",
    date: "2026-10-15",
    excerpt:
      "How AI agents and tool calling really work: tool definitions, the agent loop, a full Python example, guardrails, and when not to build an agent.",
    tags: ["AI", "LLM", "Python"],
    keywords: [
      "ai agents explained",
      "tool calling",
      "function calling llm",
      "agent loop python",
      "ai agent guardrails",
      "build an ai agent",
      "agent vs chatbot",
    ],
  },
  {
    slug: "how-to-become-an-ai-developer",
    title: "How to Become an AI Developer in 2026 (Coming From Web Development)",
    date: "2026-10-15",
    excerpt:
      "A practical 2026 roadmap from web developer to AI developer: Python, LLM APIs, prompting, RAG, agents, evals, ML basics, and portfolio project ideas.",
    tags: ["AI", "Career", "Python"],
    keywords: [
      "how to become an ai developer",
      "ai developer roadmap 2026",
      "web developer to ai developer",
      "learn ai development",
      "ai portfolio projects",
      "llm developer skills",
      "ai engineer roadmap",
    ],
  },
  {
    slug: "react-vs-nextjs",
    title: "React vs Next.js in 2026: Which Should You Use?",
    date: "2026-10-15",
    excerpt:
      "React vs Next.js in 2026: SPA vs SSR, SSG and Server Components, plus SEO, routing, hosting, a decision table, and when Vite + React is still the right call.",
    tags: ["React", "Next.js", "SEO"],
    keywords: [
      "react vs next.js",
      "next.js vs react 2026",
      "vite react",
      "react server components",
      "next.js app router",
      "spa vs ssr",
      "react seo",
    ],
  },
  {
    slug: "prompt-engineering-for-developers",
    title: "Prompt Engineering for Developers: 10 Patterns That Actually Work",
    date: "2026-10-15",
    excerpt:
      '10 practical prompt engineering patterns for developers: context, XML tags, examples, structured JSON output, "I don\'t know" paths, task splitting and evals.',
    tags: ["AI", "LLM"],
    keywords: [
      "prompt engineering for developers",
      "prompt engineering patterns",
      "llm structured output",
      "few-shot prompting",
      "xml tags prompts",
      "llm evals",
      "reduce hallucinations",
    ],
  },
  {
    slug: "full-stack-developer-roadmap",
    title: "Full Stack Developer Roadmap 2026: What to Learn, in Order",
    date: "2026-10-15",
    excerpt:
      "A practical full stack developer roadmap for 2026: what to learn in order, from JavaScript to React, Node, Postgres, auth, Docker and AI, with real projects.",
    tags: ["Career", "React", "Node.js"],
    keywords: [
      "full stack developer roadmap",
      "full stack developer roadmap 2026",
      "how to become a full stack developer",
      "learn web development",
      "react node postgres",
      "full stack projects",
    ],
  },
  {
    slug: "vector-database-comparison",
    title: "Pinecone vs Chroma vs pgvector: Choosing a Vector Database for RAG",
    date: "2026-10-15",
    excerpt:
      "Pinecone vs Chroma vs pgvector for RAG: how each one works, a side-by-side comparison, a pgvector SQL setup with HNSW, and which I use by default.",
    tags: ["AI", "RAG"],
    keywords: [
      "vector database comparison",
      "pinecone vs chroma",
      "pgvector",
      "vector database for rag",
      "pgvector hnsw index",
      "chroma vs pgvector",
      "rag vector store",
    ],
  },
  {
    slug: "jwt-authentication-react-node",
    title: "JWT Authentication in React + Node.js: The Secure Way",
    date: "2026-10-15",
    excerpt:
      "Secure JWT authentication in React and Node.js: httpOnly cookies, refresh token rotation, bcrypt, CORS, CSRF and logout, with working Express 5 code.",
    tags: ["Node.js", "React", "Security"],
    keywords: [
      "jwt authentication react node",
      "jwt httponly cookie",
      "refresh token rotation",
      "express jwt auth",
      "jwt localstorage vs cookie",
      "bcrypt password hashing",
      "react authentication",
    ],
  },
  {
    slug: "react-seo-single-page-app",
    title: "React SEO: How to Make a Single-Page App Rank on Google",
    date: "2026-10-15",
    excerpt:
      "A practical React SEO guide for SPAs: per-route meta with react-helmet-async, canonicals, sitemaps, JSON-LD, prerendering, and when to move to Next.js.",
    tags: ["React", "SEO", "Next.js"],
    keywords: [
      "react seo",
      "single page app seo",
      "react-helmet-async",
      "spa seo google",
      "react prerendering",
      "react sitemap",
      "json-ld react",
    ],
  },
  {
    slug: "fastapi-vs-nodejs",
    title: "FastAPI vs Node.js (Express): Which Backend Should You Pick?",
    date: "2026-10-15",
    excerpt:
      "FastAPI vs Node.js (Express): the same endpoint in both, Pydantic vs Zod, async models, ecosystem, AI integration, and my rule of thumb for picking one.",
    tags: ["Node.js", "Python"],
    keywords: [
      "fastapi vs node.js",
      "fastapi vs express",
      "python vs node backend",
      "pydantic vs zod",
      "best backend for ai apps",
      "fastapi tutorial",
      "express 5",
    ],
  },
  {
    slug: "react-performance-optimization",
    title: "React Performance Optimization: 9 Techniques That Actually Matter",
    date: "2026-10-15",
    excerpt:
      "9 React performance techniques worth using: profiling, code splitting, virtualization, React Compiler, useTransition, bundle analysis and server fetching.",
    tags: ["React", "Performance"],
    keywords: [
      "react performance optimization",
      "react compiler",
      "react re-renders",
      "usetransition",
      "react code splitting",
      "list virtualization react",
      "improve inp react",
    ],
  },
  {
    slug: "docker-for-web-developers",
    title: "Docker for Web Developers: Containerize a Full-Stack App",
    date: "2026-10-15",
    excerpt:
      "Docker for web developers: a multi-stage Node.js Dockerfile, .dockerignore, and docker-compose with Postgres, volumes, healthchecks and env vars.",
    tags: ["DevOps", "Node.js"],
    keywords: [
      "docker for web developers",
      "dockerize node app",
      "docker compose postgres",
      "multi-stage dockerfile node",
      "dockerignore",
      "docker healthcheck",
      "containerize full stack app",
    ],
  },
  {
    slug: "why-i-default-to-tailwind",
    title: "Why I Default to Tailwind CSS on New Projects",
    date: "2026-03-02",
    updated: "2026-10-15",
    excerpt:
      "Why I start new projects with Tailwind CSS v4, and how I keep it readable: @theme tokens, class sorting, component extraction, and a cn() helper.",
    tags: ["CSS", "React"],
    keywords: [
      "tailwind css",
      "tailwind v4",
      "tailwind theme",
      "prettier-plugin-tailwindcss",
      "tailwind-merge",
      "tailwind best practices",
      "why use tailwind",
    ],
  },
  {
    slug: "lighthouse-90-checklist",
    title: "My Pre-Launch Checklist for a 90+ Lighthouse Score",
    date: "2026-01-18",
    updated: "2026-10-15",
    excerpt:
      "My pre-launch checklist for a 90+ Lighthouse score, covering performance, accessibility, best practices and SEO: LCP images, fonts, CLS and INP.",
    tags: ["Performance", "SEO"],
    keywords: [
      "lighthouse score",
      "lighthouse checklist",
      "improve lighthouse score",
      "core web vitals",
      "fetchpriority high",
      "reduce cls",
      "improve lcp",
    ],
  },
  {
    slug: "offline-first-lessons-focusloop",
    title: "What Building an Offline-First App Taught Me",
    date: "2025-11-05",
    updated: "2026-10-15",
    excerpt:
      "What building FocusLoop taught me about offline-first apps: service worker caching, IndexedDB, a sync queue, last-write-wins, and when CRDTs make sense.",
    tags: ["React", "Performance"],
    keywords: [
      "offline-first app",
      "service worker caching",
      "indexeddb",
      "offline sync",
      "last write wins",
      "pwa offline",
      "crdt",
    ],
  },
];

const CONTENT = import.meta.glob("../content/blog/*.md", { query: "?raw", import: "default", eager: true });

export const BLOG_POSTS = POSTS_META.map((meta) => {
  const content = CONTENT[`../content/blog/${meta.slug}.md`] ?? "";
  return {
    ...meta,
    content,
    readMinutes: readingTime(content),
    searchText: [meta.title, meta.excerpt, ...meta.tags, ...(meta.keywords ?? []), stripMarkdown(content)]
      .join(" ")
      .toLowerCase(),
  };
})
  .filter((post) => post.content)
  .sort((a, b) => b.date.localeCompare(a.date));

export function formatDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
