/**
 * Scoped i18n dictionary: covers the chrome that appears on every page
 * (nav, footer, hero, common actions) in English and Urdu. Page-specific
 * body copy stays English-only for now — extend this file and swap
 * hardcoded strings for `t("key")` the same way as the sections below
 * if you want full-page translation.
 */
export const TRANSLATIONS = {
  en: {
    dir: "ltr",
    nav: {
      home: "Home",
      about: "About",
      skills: "Skills",
      projects: "Projects",
      experience: "Experience",
      blog: "Blog",
      contact: "Contact",
    },
    hero: {
      eyebrow: "// hello, world",
      greeting: "I'm Akif Shahzad,",
      buildingWord: "building",
      forTheWeb: "for the web.",
      tagline:
        "I turn product ideas into full-stack web apps and AI-powered features — responsive interfaces, solid APIs, and LLM integrations that actually ship.",
      hireMe: "Hire Me",
      downloadResume: "Download Résumé",
    },
    footer: {
      quickLinks: "// quick links",
      elsewhere: "// elsewhere",
      backToTop: "back to top",
      rights: "All rights reserved.",
    },
    common: {
      switchLanguage: "اردو",
    },
  },
  ur: {
    dir: "rtl",
    nav: {
      home: "ہوم",
      about: "تعارف",
      skills: "مہارتیں",
      projects: "پراجیکٹس",
      experience: "تجربہ",
      blog: "بلاگ",
      contact: "رابطہ",
    },
    hero: {
      eyebrow: "// ہیلو، ورلڈ",
      greeting: "میں عاکف شہزاد ہوں،",
      buildingWord: "تعمیر",
      forTheWeb: "ویب کے لیے۔",
      tagline: "میں پروڈکٹ آئیڈیاز کو مکمل فل اسٹیک ویب ایپس اور اے آئی فیچرز میں بدلتا ہوں — ریسپانسیو انٹرفیس، مضبوط APIs، اور LLM انٹیگریشنز۔",
      hireMe: "مجھے ہائر کریں",
      downloadResume: "ریزیومے ڈاؤن لوڈ کریں",
    },
    footer: {
      quickLinks: "// فوری لنکس",
      elsewhere: "// دیگر",
      backToTop: "اوپر جائیں",
      rights: "جملہ حقوق محفوظ ہیں۔",
    },
    common: {
      switchLanguage: "English",
    },
  },
};
