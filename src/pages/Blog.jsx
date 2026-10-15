import { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FiSearch, FiX, FiArrowRight } from "react-icons/fi";
import Seo from "../components/ui/Seo";
import SectionHeading from "../components/ui/SectionHeading";
import Reveal from "../components/ui/Reveal";
import BlogCard from "../components/ui/BlogCard";
import { BLOG_POSTS, BLOG_TOPICS, formatDate } from "../data/blog";
import { cn } from "../utils/cn";

export default function Blog() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const topic = params.get("topic") || "All";

  const setTopic = (next) => {
    const nextParams = new URLSearchParams(params);
    if (next === "All") nextParams.delete("topic");
    else nextParams.set("topic", next);
    setParams(nextParams, { replace: true });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BLOG_POSTS.filter((post) => {
      const inTopic = topic === "All" || post.tags.includes(topic);
      const inQuery = !q || post.searchText.includes(q);
      return inTopic && inQuery;
    });
  }, [query, topic]);

  const featured = BLOG_POSTS.find((p) => p.featured);
  const showFeatured = featured && topic === "All" && !query;
  const list = showFeatured ? filtered.filter((p) => p !== featured) : filtered;

  return (
    <>
      <Seo
        title="Blog — Full Stack & AI Development Guides"
        description="Practical guides from Akif Shahzad on AI chatbots, RAG, LLM agents, React, Next.js, Node.js, FastAPI, performance, SEO and full-stack development."
        path="/blog"
      />
      <section className="py-20">
        <div className="container-app">
          <SectionHeading
            comment="// posts.sort(byDate)"
            title="Guides on full-stack & AI development"
            description="Hands-on write-ups on building AI features, modern web apps, and shipping them to production."
          />

          {/* Search + popular topics */}
          <div className="mt-10 space-y-4">
            <div className="relative max-w-md">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-paper-300 light:text-ink-700" />
              <label htmlFor="blog-search" className="sr-only">Search posts</label>
              <input
                id="blog-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search: RAG, React, JWT, Docker…"
                className="w-full rounded-xl border border-ink-600 light:border-paper-300 bg-ink-800 light:bg-paper-100 py-2.5 pl-9 pr-9 text-sm text-paper-100 light:text-ink-900 outline-none focus:border-teal-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-paper-300 hover:text-amber-400"
                >
                  <FiX />
                </button>
              )}
            </div>

            <div>
              <p className="eyebrow">// popular-topics</p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
                {["All", ...BLOG_TOPICS].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopic(t)}
                    aria-pressed={topic === t}
                    className={cn(
                      "rounded-full border px-3 py-1 font-mono text-xs transition-colors",
                      topic === t
                        ? "border-amber-400 bg-amber-400 text-ink-950"
                        : "border-ink-600 light:border-paper-300 text-paper-300 light:text-ink-700 hover:border-teal-400 hover:text-teal-400"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {showFeatured && (
            <Reveal className="mt-10">
              <article className="rounded-xl border border-amber-400/50 bg-ink-800 light:bg-paper-100 p-6 md:p-8">
                <p className="font-mono text-xs text-amber-400">
                  ★ featured · {formatDate(featured.date)} · {featured.readMinutes} min read
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-paper-100 light:text-ink-950 md:text-3xl">
                  <Link to={`/blog/${featured.slug}`} className="hover:text-amber-400 transition-colors">
                    {featured.title}
                  </Link>
                </h2>
                <p className="mt-3 max-w-2xl text-paper-300 light:text-ink-700">{featured.excerpt}</p>
                <Link
                  to={`/blog/${featured.slug}`}
                  className="mt-5 inline-flex items-center gap-1.5 font-mono text-xs text-teal-400 hover:text-amber-400"
                >
                  Read the guide <FiArrowRight />
                </Link>
              </article>
            </Reveal>
          )}

          <p className="mt-8 font-mono text-xs text-paper-300 light:text-ink-700" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "post" : "posts"}
            {topic !== "All" && ` in ${topic}`}
            {query && ` matching "${query}"`}
          </p>

          {list.length > 0 ? (
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((post, i) => (
                <Reveal key={post.slug} delay={Math.min(i, 5) * 0.06}>
                  <BlogCard post={post} />
                </Reveal>
              ))}
            </div>
          ) : (
            filtered.length === 0 && (
              <p className="mt-6 text-paper-300 light:text-ink-700">
                No posts match that yet — try another topic, or{" "}
                <Link to="/contact" className="text-teal-400 hover:text-amber-400">suggest one</Link>.
              </p>
            )
          )}
        </div>
      </section>
    </>
  );
}
