import { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { FiCopy, FiCheck } from "react-icons/fi";

const INLINE = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

function Inline({ text }) {
  return text.split(INLINE).map((part, i) => {
    if (!part) return null;
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-ink-800 light:bg-paper-200 px-1.5 py-0.5 font-mono text-[0.85em] text-amber-400">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-paper-100 light:text-ink-950">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, label, href] = link;
      const cls = "text-teal-400 underline decoration-teal-400/40 underline-offset-2 hover:text-amber-400";
      return href.startsWith("/") ? (
        <Link key={i} to={href} className={cls}>{label}</Link>
      ) : (
        <a key={i} href={href} target="_blank" rel="noopener noreferrer" className={cls}>{label}</a>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function CodeBlock({ lang, text }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable (insecure context) — nothing to do
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-ink-700 light:border-paper-300 bg-ink-950 light:bg-ink-900">
      <div className="flex items-center justify-between border-b border-ink-700 px-4 py-2">
        <span className="font-mono text-[11px] text-teal-400">{lang || "code"}</span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code"
          className="flex items-center gap-1 font-mono text-[11px] text-paper-300 hover:text-amber-400"
        >
          {copied ? <FiCheck /> : <FiCopy />} {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-paper-200">
        <code>{text}</code>
      </pre>
    </div>
  );
}

export default function Markdown({ blocks }) {
  return (
    <div className="space-y-5 leading-relaxed text-paper-300 light:text-ink-700">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 key={i} id={block.id} className="scroll-mt-24 pt-4 font-display text-2xl font-semibold text-paper-100 light:text-ink-950">
                <Inline text={block.text} />
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} id={block.id} className="scroll-mt-24 pt-2 font-display text-lg font-semibold text-paper-100 light:text-ink-950">
                <Inline text={block.text} />
              </h3>
            );
          case "ul":
          case "ol": {
            const List = block.type;
            return (
              <List key={i} className={`space-y-2 pl-6 ${block.type === "ul" ? "list-disc" : "list-decimal"} marker:text-amber-400`}>
                {block.items.map((item, j) => (
                  <li key={j}><Inline text={item} /></li>
                ))}
              </List>
            );
          }
          case "quote":
            return (
              <blockquote key={i} className="border-l-4 border-amber-400 bg-ink-800/60 light:bg-paper-200 px-4 py-3 italic">
                <Inline text={block.text} />
              </blockquote>
            );
          case "code":
            return <CodeBlock key={i} lang={block.lang} text={block.text} />;
          case "table":
            return (
              <div key={i} className="overflow-x-auto rounded-xl border border-ink-700 light:border-paper-300">
                <table className="w-full text-left text-sm">
                  <thead className="bg-ink-800 light:bg-paper-200 text-paper-100 light:text-ink-950">
                    <tr>
                      {block.header.map((cell, j) => (
                        <th key={j} className="px-4 py-2 font-semibold"><Inline text={cell} /></th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, r) => (
                      <tr key={r} className="border-t border-ink-700 light:border-paper-300">
                        {row.map((cell, j) => (
                          <td key={j} className="px-4 py-2 align-top"><Inline text={cell} /></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          default:
            return <p key={i}><Inline text={block.text} /></p>;
        }
      })}
    </div>
  );
}
