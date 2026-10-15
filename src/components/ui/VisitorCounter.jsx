import { useState } from "react";

/**
 * Shows a live visitor count via the free visitor-badge.laobi.icu service
 * (no backend or API key needed). Renders nothing if the badge fails to
 * load, so a network hiccup never leaves a broken-image icon in the footer.
 */
export default function VisitorCounter({ path = "akif-butt-portfolio" }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <img
      src={`https://visitor-badge.laobi.icu/badge?page_id=${encodeURIComponent(path)}`}
      alt="Visitor count for this site"
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-5"
    />
  );
}
