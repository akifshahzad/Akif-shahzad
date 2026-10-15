import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiLink, FiCheck, FiLinkedin, FiTwitter } from "react-icons/fi";
import Seo from "../components/ui/Seo";
import Reveal from "../components/ui/Reveal";
import Button from "../components/ui/Button";
import Markdown from "../components/ui/Markdown";
import BlogCard from "../components/ui/BlogCard";
import { BLOG_POSTS, formatDate } from "../data/blog";
import { parseMarkdown } from "../utils/markdown";
import { SITE } from "../constants";

function ShareButtons({ url, title }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const btn =
    "flex items-center gap-1.5 rounded-lg border border-ink-600 light:border-paper-300 px-3 py-1.5 font-mono text-xs text-paper-200 light:text-ink-900 hover:border-teal-400 hover:text-teal-400 transition-colors";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <a
        className={btn}
        target="_blank"
        rel="noopener noreferrer"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
      >
        <FiLinkedin /> Share
      </a>
      <a
        className={btn}
        target="_blank"
        rel="noopener noreferrer"
        href={`https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodedUrl}`}
      >
        <FiTwitter /> Post
      </a>
      <button type="button" onClick={copy} className={btn}>
        {copied ? <FiCheck /> : <FiLink />} {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}

export default function BlogPost() {
  const { slug } = useParams();
  const index = BLOG_POSTS.findIndex((p) => p.slug === slug);
  const post = BLOG_POSTS[index];

  const blocks = useMemo(() => (post ? parseMarkdown(post.content) : []), [post]);

  if (!post) {
    return (
      <section className="py-20">
        <Seo title="Post not found" description="This blog post doesn't exist." path={`/blog/${slug}`} noindex />
        <div className="container-app text-center">
          <h1 className="font-display text-2xl font-semibold text-paper-100 light:text-ink-950">Post not found</h1>
          <div className="mt-6 flex justify-center">
            <Button to="/blog" icon={FiArrowLeft}>Back to Blog</Button>
          </div>
        </div>
      </section>
    );
  }

  const toc = blocks.filter((b) => b.type === "h2");
  const url = `${SITE.url}/blog/${post.slug}`;
  const newer = BLOG_POSTS[index - 1];
  const older = BLOG_POSTS[index + 1];
  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug)
    .map((p) => ({ p, score: p.tags.filter((t) => post.tags.includes(t)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ p }) => p);

  return (
    <>
      <Seo
        title={post.title}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        type="article"
        publishedDate={post.date}
        modifiedDate={post.updated}
        keywords={post.keywords}
        tags={post.tags}
      />
      <article className="py-20">
        <div className="container-app max-w-3xl">
          <Reveal>
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-teal-400 hover:text-amber-400 transition-colors"
            >
              <FiArrowLeft /> all posts
            </Link>

            <p className="mt-6 font-mono text-xs text-teal-400">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              {post.updated && post.updated !== post.date && <> · updated {formatDate(post.updated)}</>}
              {" · "}
              {post.readMinutes} min read
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold leading-tight text-paper-100 light:text-ink-950 md:text-4xl">
              {post.title}
            </h1>
            <p className="mt-3 text-sm text-paper-300 light:text-ink-700">
              By <Link to="/about" className="text-teal-400 hover:text-amber-400">{SITE.name}</Link> — {SITE.role}
            </p>

            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Post tags">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    to={`/blog?topic=${encodeURIComponent(tag)}`}
                    className="inline-block rounded-full bg-ink-800 light:bg-paper-200 px-2.5 py-1 font-mono text-[11px] text-amber-400 hover:text-teal-400"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          {toc.length > 2 && (
            <nav
              aria-label="Table of contents"
              className="mt-8 rounded-xl border border-ink-700 light:border-paper-300 bg-ink-800 light:bg-paper-100 p-5"
            >
              <p className="eyebrow">// on-this-page</p>
              <ol className="mt-3 space-y-1.5 text-sm">
                {toc.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="text-paper-300 light:text-ink-700 hover:text-amber-400">
                      {h.text.replace(/[`*]/g, "")}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className="mt-8">
            <Markdown blocks={blocks} />
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t border-ink-700 light:border-paper-300 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-xs text-paper-300 light:text-ink-700">Found this useful? Share it:</p>
            <ShareButtons url={url} title={post.title} />
          </div>

          {/* Author box */}
          <div className="mt-8 rounded-xl border border-ink-700 light:border-paper-300 bg-ink-800 light:bg-paper-100 p-6">
            <p className="eyebrow">// about-the-author</p>
            <p className="mt-2 font-display text-lg font-semibold text-paper-100 light:text-ink-950">{SITE.name}</p>
            <p className="mt-1 text-sm text-paper-300 light:text-ink-700">
              {SITE.role} in {SITE.location}. I build React/Next.js apps, Node.js and FastAPI backends, and AI
              features like chatbots and RAG search for startups and small businesses.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button to="/contact" icon={FiArrowRight}>Work with me</Button>
              <Button href={SITE.social.linkedin} variant="secondary">LinkedIn</Button>
            </div>
          </div>

          {(newer || older) && (
            <nav aria-label="More posts" className="mt-8 grid gap-4 sm:grid-cols-2">
              {older ? (
                <Link
                  to={`/blog/${older.slug}`}
                  className="rounded-xl border border-ink-700 light:border-paper-300 p-4 hover:border-teal-400"
                >
                  <span className="font-mono text-[11px] text-teal-400">← older</span>
                  <span className="mt-1 block text-sm text-paper-100 light:text-ink-950">{older.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {newer && (
                <Link
                  to={`/blog/${newer.slug}`}
                  className="rounded-xl border border-ink-700 light:border-paper-300 p-4 text-right hover:border-teal-400"
                >
                  <span className="font-mono text-[11px] text-teal-400">newer →</span>
                  <span className="mt-1 block text-sm text-paper-100 light:text-ink-950">{newer.title}</span>
                </Link>
              )}
            </nav>
          )}
        </div>

        {related.length > 0 && (
          <div className="container-app mt-16">
            <p className="eyebrow">// keep-reading</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-paper-100 light:text-ink-950">Related posts</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <BlogCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  );
}
