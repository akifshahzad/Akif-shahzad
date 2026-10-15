import { Link } from "react-router-dom";
import { FiGithub, FiLinkedin, FiTwitter, FiArrowUp } from "react-icons/fi";
import { FOOTER_LINKS, SITE } from "../../constants";
import VisitorCounter from "../ui/VisitorCounter";
import { useLanguage } from "../../i18n/LanguageContext";

export default function Footer() {
  const year = new Date().getFullYear();
  const { dict } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-ink-700 light:border-paper-300 bg-ink-950 light:bg-paper-200">
      <div className="container-app grid gap-10 py-14 md:grid-cols-3">
        <div>
          <p className="font-mono text-sm font-semibold text-paper-200 light:text-ink-900">
            akif<span className="text-teal-400">.</span>shahzad
          </p>
          <p className="mt-3 max-w-xs text-sm text-paper-300 light:text-ink-700">
            {SITE.tagline}
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="eyebrow">{dict.footer.quickLinks}</p>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm" role="list">
            {FOOTER_LINKS.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className="text-paper-300 light:text-ink-700 hover:text-amber-400 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="eyebrow">{dict.footer.elsewhere}</p>
          <div className="mt-3 flex gap-3">
            <a
              href={SITE.social.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub profile"
              className="rounded-lg bg-ink-800 light:bg-paper-100 p-2.5 text-paper-200 light:text-ink-900 hover:text-amber-400 transition-colors"
            >
              <FiGithub />
            </a>
            <a
              href={SITE.social.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn profile"
              className="rounded-lg bg-ink-800 light:bg-paper-100 p-2.5 text-paper-200 light:text-ink-900 hover:text-amber-400 transition-colors"
            >
              <FiLinkedin />
            </a>
            <a
              href={SITE.social.twitter}
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter / X profile"
              className="rounded-lg bg-ink-800 light:bg-paper-100 p-2.5 text-paper-200 light:text-ink-900 hover:text-amber-400 transition-colors"
            >
              <FiTwitter />
            </a>
          </div>
        </div>
      </div>

      <div className="container-app flex flex-col items-center justify-between gap-3 border-t border-ink-700 light:border-paper-300 py-5 text-xs text-paper-300 light:text-ink-700 md:flex-row">
        <p>© {year} {SITE.name}. {dict.footer.rights}</p>
        {/* <VisitorCounter /> */}
        <button
          type="button"
          onClick={scrollToTop}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 font-mono hover:text-amber-400 transition-colors"
        >
          <FiArrowUp /> {dict.footer.backToTop}
        </button>
      </div>
    </footer>
  );
}
