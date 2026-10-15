import { useState } from "react";
import Reveal from "./Reveal";

/**
 * Renders a public GitHub contribution graph via the ghchart.rshah.org
 * image service — no API key or backend required. Falls back to a
 * link if the image fails to load (e.g. offline, or rate-limited).
 */
export default function GithubContributions({ username }) {
  const [errored, setErrored] = useState(false);
  const src = `https://ghchart.rshah.org/2f9a90/${username}`;

  return (
    <Reveal>
      <div className="rounded-xl border border-ink-700 light:border-paper-300 bg-ink-800 light:bg-paper-100 p-5">
        <p className="eyebrow">// github.contributions()</p>
        <h3 className="mt-1 font-display font-semibold text-paper-100 light:text-ink-950">
          Contribution activity
        </h3>

        {errored ? (
          <p className="mt-4 text-sm text-paper-300 light:text-ink-700">
            Couldn't load the live graph right now — see it directly on{" "}
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noreferrer"
              className="text-teal-400 hover:text-amber-400"
            >
              GitHub
            </a>
            .
          </p>
        ) : (
          <img
            src={src}
            alt={`${username}'s GitHub contribution graph`}
            loading="lazy"
            onError={() => setErrored(true)}
            className="mt-4 w-full"
            width={720}
            height={112}
          />
        )}
      </div>
    </Reveal>
  );
}
