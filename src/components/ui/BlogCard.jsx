import { Link } from "react-router-dom";
import { formatDate } from "../../data/blog";

export default function BlogCard({ post }) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-ink-700 light:border-paper-300 bg-ink-800 light:bg-paper-100 p-6 transition-colors hover:border-teal-400">
      <p className="font-mono text-xs text-teal-400">
        {formatDate(post.date)} · {post.readMinutes} min read
      </p>
      <h2 className="mt-2 font-display text-lg font-semibold text-paper-100 light:text-ink-950">
        <Link to={`/blog/${post.slug}`} className="hover:text-amber-400 transition-colors">
          {post.title}
        </Link>
      </h2>
      <p className="mt-2 flex-1 text-sm text-paper-300 light:text-ink-700">{post.excerpt}</p>
      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Post tags">
        {post.tags.map((tag) => (
          <li key={tag} className="rounded-full bg-ink-700 light:bg-paper-200 px-2.5 py-1 font-mono text-[11px] text-amber-400">
            {tag}
          </li>
        ))}
      </ul>
      <Link
        to={`/blog/${post.slug}`}
        className="mt-4 inline-block font-mono text-xs text-teal-400 hover:text-amber-400 transition-colors"
        aria-label={`Read: ${post.title}`}
      >
        Read post →
      </Link>
    </article>
  );
}
