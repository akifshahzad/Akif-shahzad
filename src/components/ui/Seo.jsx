import { Helmet } from "react-helmet-async";
import { SITE } from "../../constants";

const OG_IMAGE = `${SITE.url}/og-image.png`;

export default function Seo({
  title,
  description,
  path = "/",
  type = "website",
  publishedDate,
  modifiedDate,
  keywords,
  tags,
  noindex = false,
}) {
  const fullTitle = title && title !== "Home" ? `${title} — ${SITE.name}` : `${SITE.name} — ${SITE.role}`;
  const url = `${SITE.url}${path}`;

  const articleSchema = publishedDate
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: title,
        description,
        datePublished: publishedDate,
        dateModified: modifiedDate || publishedDate,
        image: OG_IMAGE,
        keywords: keywords?.join(", "),
        articleSection: tags?.[0],
        inLanguage: "en",
        author: { "@type": "Person", name: SITE.name, url: SITE.url },
        publisher: { "@type": "Person", name: SITE.name, url: SITE.url },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        url,
      }
    : null;

  const breadcrumbSchema = publishedDate
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.url}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE.url}/blog` },
          { "@type": "ListItem", position: 3, name: title, item: url },
        ],
      }
    : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords?.length > 0 && <meta name="keywords" content={keywords.join(", ")} />}
      {noindex ? <meta name="robots" content="noindex, follow" /> : <link rel="canonical" href={url} />}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={OG_IMAGE} />
      {publishedDate && <meta property="article:published_time" content={publishedDate} />}
      {publishedDate && <meta property="article:modified_time" content={modifiedDate || publishedDate} />}
      {publishedDate && <meta property="article:author" content={SITE.name} />}
      {tags?.map((tag) => <meta key={tag} property="article:tag" content={tag} />)}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
      {articleSchema && <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>}
      {breadcrumbSchema && <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>}
    </Helmet>
  );
}
