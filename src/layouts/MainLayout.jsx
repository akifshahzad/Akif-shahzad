import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Chatbot from "../components/ui/Chatbot";
import { useScrollToTop } from "../hooks/useScrollToTop";
import { initAnalytics, trackPageView } from "../utils/analytics";

export default function MainLayout() {
  const location = useLocation();
  useScrollToTop();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-amber-400 focus:px-4 focus:py-2 focus:text-ink-950"
      >
        Skip to main content
      </a>
      <Navbar />
      <motion.main
        id="main-content"
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex-1"
      >
        <Outlet />
      </motion.main>
      <Footer />
      <Chatbot />
    </div>
  );
}
