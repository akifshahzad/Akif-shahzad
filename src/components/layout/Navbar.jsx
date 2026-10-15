import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiSun, FiMoon, FiMenu, FiX } from "react-icons/fi";
import { NAV_LINKS } from "../../constants";
import { useTheme } from "../../hooks/useTheme";
import { cn } from "../../utils/cn";
import LanguageSwitcher from "../ui/LanguageSwitcher";

const fileNames = {
  "/": "Home.jsx",
  "/about": "About.jsx",
  "/skills": "Skills.jsx",
  "/projects": "Projects.jsx",
  "/experience": "Experience.jsx",
  "/blog": "Blog.jsx",
  "/contact": "Contact.jsx",
};

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-shadow duration-300",
        scrolled ? "glass shadow-lg shadow-black/10" : "bg-transparent"
      )}
    >
      <nav
        aria-label="Primary"
        className="container-app flex h-16 items-center justify-between"
      >
        <Link
          to="/"
          className="flex items-center gap-2 font-mono text-sm font-semibold text-paper-200 light:text-ink-900"
          onClick={() => setOpen(false)}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink-800 light:bg-paper-200 text-amber-400">
            &lt;/&gt;
          </span>
          <span>akif<span className="text-teal-400">.</span>shahzad</span>
        </Link>

        {/* Desktop: file-tab style nav */}
        <ul className="hidden items-center gap-1 md:flex" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                end={link.path === "/"}
                className={({ isActive }) =>
                  cn(
                    "group relative flex items-center gap-1.5 rounded-t-md px-3 py-2 font-mono text-xs transition-colors",
                    isActive
                      ? "bg-ink-800 light:bg-paper-200 text-amber-400"
                      : "text-paper-300 light:text-ink-700 hover:text-teal-400"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isActive ? "bg-amber-400" : "bg-ink-600 group-hover:bg-teal-400"
                      )}
                      aria-hidden="true"
                    />
                    {fileNames[link.path]}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="relative overflow-hidden rounded-lg p-2 text-paper-200 light:text-ink-900 hover:bg-ink-800 light:hover:bg-paper-200 transition-colors"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex"
              >
                {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
              </motion.span>
            </AnimatePresence>
          </button>

          <button
            type="button"
            className="rounded-lg p-2 text-paper-200 light:text-ink-900 hover:bg-ink-800 light:hover:bg-paper-200 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden md:hidden glass"
          >
            <ul className="container-app flex flex-col gap-1 py-3" role="list">
              {NAV_LINKS.map((link) => (
                <li key={link.path}>
                  <NavLink
                    to={link.path}
                    end={link.path === "/"}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 font-mono text-sm",
                        isActive
                          ? "bg-ink-800 light:bg-paper-200 text-amber-400"
                          : "text-paper-300 light:text-ink-700"
                      )
                    }
                  >
                    {fileNames[link.path]}
                  </NavLink>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
