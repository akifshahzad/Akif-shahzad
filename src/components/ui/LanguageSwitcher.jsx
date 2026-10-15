import { useLanguage } from "../../i18n/LanguageContext";

export default function LanguageSwitcher() {
  const { lang, dict, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={lang === "en" ? "Switch to Urdu" : "Switch to English"}
      className="rounded-lg px-2.5 py-1.5 font-mono text-xs text-paper-200 light:text-ink-900 hover:bg-ink-800 light:hover:bg-paper-200 transition-colors"
    >
      {dict.common.switchLanguage}
    </button>
  );
}
