import { SITE } from "../constants";

/**
 * Loads gtag.js once, only if a GA4 measurement ID is configured
 * (VITE_GA_MEASUREMENT_ID). Safe to call multiple times.
 */
export function initAnalytics() {
  const id = SITE.googleAnalyticsId;
  if (!id || typeof window === "undefined" || window.__gaInitialized) return;

  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", id, { send_page_view: false });
  window.__gaInitialized = true;
}

/** Tracks a page view. Call on route change. */
export function trackPageView(path) {
  if (typeof window === "undefined" || !window.gtag || !SITE.googleAnalyticsId) return;
  window.gtag("event", "page_view", { page_path: path });
}

/** Tracks a custom event, e.g. résumé downloads or contact form submits. */
export function trackEvent(name, params = {}) {
  if (typeof window === "undefined" || !window.gtag || !SITE.googleAnalyticsId) return;
  window.gtag("event", name, params);
}
