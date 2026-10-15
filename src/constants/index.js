/**
 * Single source of truth for identity and links. Seo.jsx, the chatbot,
 * hero, footer and contact page all read from here — keep index.html,
 * public/sitemap.xml and public/robots.txt in sync with `url` by hand.
 */
export const SITE = {
  name: "Akif Shahzad",
  role: "Full Stack & AI Developer",
  tagline: "I build fast web apps, the APIs behind them, and the AI features that make them smarter.",
  url: "https://akif-shahzad.vercel.app",
  email: "akifbutt796@gmail.com",
  location: "Lahore, Pakistan",
  resumeUrl: "/resume-akif-shahzad.pdf",
  githubUsername: "akifshahzad",
  googleAnalyticsId: import.meta.env.VITE_GA_MEASUREMENT_ID || "",
  social: {
    github: "https://github.com/akifshahzad",
    linkedin: "https://www.linkedin.com/in/akifshahzad",
    twitter: "https://x.com/Akfshzad",
    // Fill these in to show them on the Contact page and in the chatbot; empty = hidden.
    upwork: "",
    fiverr: "",
  },
};

export const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Skills", path: "/skills" },
  { label: "Projects", path: "/projects" },
  { label: "Experience", path: "/experience" },
  { label: "Blog", path: "/blog" },
  { label: "Contact", path: "/contact" },
];

export const FOOTER_LINKS = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Skills", path: "/skills" },
  { label: "Projects", path: "/projects" },
  { label: "Experience", path: "/experience" },
  { label: "Services", path: "/services" },
  { label: "Certifications", path: "/certifications" },
  { label: "Blog", path: "/blog" },
  { label: "Contact", path: "/contact" },
];
