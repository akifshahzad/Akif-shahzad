import { motion } from "framer-motion";
import { FiArrowRight, FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import Button from "../ui/Button";
import TypingText from "../ui/TypingText";
import { SITE } from "../../constants";
import { useLanguage } from "../../i18n/LanguageContext";

const roles = ["Full Stack Developer", "AI Developer", "React & Next.js Engineer", "LLM & RAG Builder"];

export default function Hero() {
  const { dict } = useLanguage();
  return (
    <section className="relative overflow-hidden pt-16 pb-24 md:pt-24">
      {/* ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-40 -left-32 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl"
      />

      <div className="container-app grid items-center gap-12 md:grid-cols-2">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="eyebrow"
          >
            {dict.hero.eyebrow}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-3 font-display text-4xl font-semibold leading-tight text-paper-100 light:text-ink-950 sm:text-5xl"
          >
            {dict.hero.greeting}
            <br />
            <span className="text-amber-400">{dict.hero.buildingWord}</span> {dict.hero.forTheWeb}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-teal-400"
          >
            <TypingText words={roles} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-5 max-w-md text-paper-300 light:text-ink-700"
          >
            {dict.hero.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button to="/contact" icon={FiArrowRight}>{dict.hero.hireMe}</Button>
            {/* Résumé button hidden until the real PDF is in /public — re-enable it then.
            <Button
              href={SITE.resumeUrl}
              variant="secondary"
              icon={FiDownload}
              onClick={() => trackEvent("resume_download", { location: "hero" })}
            >
              {dict.hero.downloadResume}
            </Button> */}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex gap-4"
          >
            {[
              { icon: FiGithub, href: SITE.social.github, label: "GitHub" },
              { icon: FiLinkedin, href: SITE.social.linkedin, label: "LinkedIn" },
              // { icon: FiTwitter, href: SITE.social.twitter, label: "Twitter" },
              { icon: FiMail, href: `mailto:${SITE.email}`, label: "Email" },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                aria-label={label}
                className="text-paper-300 light:text-ink-700 hover:text-amber-400 transition-colors"
              >
                <Icon size={20} />
              </a>
            ))}
          </motion.div>
        </div>

        {/* Signature element: an editor-window "profile card" */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="animate-float justify-self-center"
        >
          <div className="w-[320px] overflow-hidden rounded-xl border border-ink-700 light:border-paper-300 bg-ink-800 light:bg-paper-100 shadow-2xl shadow-black/30 sm:w-[380px]">
            <div className="flex items-center gap-1.5 border-b border-ink-700 light:border-paper-300 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-3 font-mono text-xs text-paper-300 light:text-ink-700">akif.json</span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-paper-200 light:text-ink-800">
              {`{
  "name": `}<span className="text-amber-400">"Akif Shahzad"</span>{`,
  "role": `}<span className="text-amber-400">"Full Stack & AI Dev"</span>{`,
  "stack": [
    `}<span className="text-teal-400">"React"</span>{`,
    `}<span className="text-teal-400">"Node.js"</span>{`,
    `}<span className="text-teal-400">"FastAPI"</span>{`,
    `}<span className="text-teal-400">"LLMs"</span>{`
  ],
  "available": `}<span className="text-teal-400">true</span>{`
}`}
            </pre>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
