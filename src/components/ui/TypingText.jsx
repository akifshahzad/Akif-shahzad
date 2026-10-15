import { useEffect, useState } from "react";

const ACCENTS = ["text-amber-400", "text-teal-400"];

/**
 * Cycles through a list of strings with a typewriter effect, alternating
 * an accent color per word so the effect reads less monotone.
 * Respects prefers-reduced-motion by simply showing the first string.
 */
export default function TypingText({ words = [], typingSpeed = 70, pause = 1600 }) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReducedMotion || !words.length) {
      setText(words[0] ?? "");
      return undefined;
    }

    const current = words[wordIndex % words.length];
    let timeout;

    if (!deleting && text.length < current.length) {
      timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), typingSpeed);
    } else if (!deleting && text.length === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && text.length > 0) {
      timeout = setTimeout(() => setText(current.slice(0, text.length - 1)), typingSpeed / 2);
    } else {
      setDeleting(false);
      setWordIndex((i) => (i + 1) % words.length);
    }

    return () => clearTimeout(timeout);
  }, [text, deleting, wordIndex, words, typingSpeed, pause, prefersReducedMotion]);

  const accent = ACCENTS[wordIndex % ACCENTS.length];

  return (
    <span className={`font-mono transition-colors duration-300 ${accent}`}>
      {text}
      <span
        className="ml-0.5 inline-block w-[2px] animate-blink bg-current align-middle"
        style={{ height: "1em" }}
        aria-hidden="true"
      />
    </span>
  );
}
