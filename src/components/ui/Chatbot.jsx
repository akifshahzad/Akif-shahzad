import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiMessageSquare, FiX, FiSend, FiRefreshCw } from "react-icons/fi";
import {
  CHATBOT_FAQS,
  CHATBOT_FALLBACK,
  CHATBOT_GREETING,
  CHATBOT_SUGGESTIONS,
} from "../../data/chatbotFaqs";

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Keywords match from the start of a word; short ones (≤3 chars) must be a whole word.
const COMPILED_FAQS = CHATBOT_FAQS.map((faq) => ({
  ...faq,
  patterns: faq.match.map((keyword) => ({
    weight: keyword.length,
    regex: new RegExp(`\\b${escapeRegExp(keyword)}${keyword.length <= 3 ? "\\b" : ""}`, "i"),
  })),
}));

function getReply(message) {
  let best = null;
  let bestScore = 0;
  for (const faq of COMPILED_FAQS) {
    const score = faq.patterns.reduce((sum, p) => (p.regex.test(message) ? sum + p.weight : sum), 0);
    if (score > bestScore) {
      best = faq;
      bestScore = score;
    }
  }
  return best ? { text: best.reply, links: best.links } : { text: CHATBOT_FALLBACK.reply, links: CHATBOT_FALLBACK.links };
}

const INITIAL_MESSAGES = [{ from: "bot", text: CHATBOT_GREETING }];

/**
 * A lightweight, client-side FAQ chatbot. Answers are matched from a
 * keyword list (see data/chatbotFaqs.js) rather than calling an
 * external AI API, so it works with no backend, no API key, and no
 * ongoing cost — swap `getReply` for a real API call if you'd rather
 * wire this up to Claude or another LLM later.
 */
export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open, typing]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const ask = (raw) => {
    const text = raw.trim();
    if (!text || typing) return;

    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");
    setTyping(true);

    const reply = getReply(text);
    timerRef.current = setTimeout(() => {
      setMessages((prev) => [...prev, { from: "bot", ...reply }]);
      setTyping(false);
    }, 450);
  };

  const send = (e) => {
    e.preventDefault();
    ask(input);
  };

  const reset = () => {
    clearTimeout(timerRef.current);
    setTyping(false);
    setMessages(INITIAL_MESSAGES);
  };

  const askedQuestions = new Set(messages.filter((m) => m.from === "user").map((m) => m.text));
  const suggestions = CHATBOT_SUGGESTIONS.filter((q) => !askedQuestions.has(q)).slice(0, 4);

  const linkClass =
    "inline-flex rounded-full border border-teal-400/60 px-2.5 py-0.5 font-mono text-[11px] text-teal-400 hover:bg-teal-400 hover:text-ink-950 transition-colors";

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-label="Portfolio FAQ chatbot"
            className="glass mb-3 flex h-[500px] max-h-[calc(100vh-7rem)] w-[340px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-xl border border-ink-700 light:border-paper-300 shadow-2xl shadow-black/30"
          >
            <div className="flex items-center justify-between border-b border-ink-700 light:border-paper-300 px-4 py-3">
              <p className="font-mono text-xs text-teal-400">// ask-me-anything</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={reset}
                  aria-label="Restart conversation"
                  className="text-paper-300 light:text-ink-700 hover:text-amber-400"
                >
                  <FiRefreshCw size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="text-paper-300 light:text-ink-700 hover:text-amber-400"
                >
                  <FiX />
                </button>
              </div>
            </div>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    m.from === "bot"
                      ? "bg-ink-800 light:bg-paper-200 text-paper-200 light:text-ink-800"
                      : "ml-auto bg-amber-400 text-ink-950"
                  }`}
                >
                  {m.text}
                  {m.links?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.links.map((link) =>
                        link.to ? (
                          <Link key={link.label} to={link.to} onClick={() => setOpen(false)} className={linkClass}>
                            {link.label}
                          </Link>
                        ) : (
                          <a
                            key={link.label}
                            href={link.href}
                            target={link.href.startsWith("http") ? "_blank" : undefined}
                            rel="noreferrer"
                            className={linkClass}
                          >
                            {link.label}
                          </a>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
              {typing && (
                <div className="flex w-fit gap-1 rounded-lg bg-ink-800 light:bg-paper-200 px-3 py-3" aria-label="Typing">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-400"
                      style={{ animationDelay: `${d * 0.15}s` }}
                    />
                  ))}
                </div>
              )}
            </div>

            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 border-t border-ink-700 light:border-paper-300 px-3 pt-3">
                {suggestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => ask(q)}
                    className="rounded-full bg-ink-800 light:bg-paper-200 px-2.5 py-1 text-[11px] text-paper-200 light:text-ink-800 hover:text-amber-400 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={send} className="flex gap-2 p-3">
              <label htmlFor="chatbot-input" className="sr-only">
                Type a message
              </label>
              <input
                id="chatbot-input"
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about AI, stack, pricing…"
                className="flex-1 rounded-lg border border-ink-600 bg-ink-900 light:bg-paper-100 light:border-paper-300 px-3 py-2 text-sm text-paper-100 light:text-ink-900 outline-none focus:border-teal-400"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={typing}
                className="rounded-lg bg-amber-400 p-2 text-ink-950 hover:bg-amber-500 transition-colors disabled:opacity-60"
              >
                <FiSend />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close chatbot" : "Open chatbot"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-400 text-ink-950 shadow-xl shadow-black/30 hover:bg-amber-500 transition-colors"
      >
        {open ? <FiX size={22} /> : <FiMessageSquare size={22} />}
      </button>
    </div>
  );
}
