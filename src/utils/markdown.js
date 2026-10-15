/**
 * A small Markdown parser for blog posts — enough for headings, paragraphs,
 * lists, blockquotes, fenced code, GFM tables and inline code/bold/links,
 * without pulling a full Markdown library into the bundle.
 * Returns a flat array of block objects that <Markdown> renders.
 */

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[`*[\]()]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const splitRow = (line) =>
  line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim());

const isTableSeparator = (line) => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(line);

export function parseMarkdown(source) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    const fence = line.match(/^```(\w+)?/);
    if (fence) {
      const code = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      i++; // closing fence
      blocks.push({ type: "code", lang: fence[1] || "", text: code.join("\n") });
      continue;
    }

    const heading = line.match(/^(#{2,3})\s+(.*)/);
    if (heading) {
      const text = heading[2].trim();
      blocks.push({ type: heading[1].length === 2 ? "h2" : "h3", text, id: slugify(text) });
      i++;
      continue;
    }

    if (line.includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const header = splitRow(line);
      const rows = [];
      i += 2;
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) rows.push(splitRow(lines[i++]));
      blocks.push({ type: "table", header, rows });
      continue;
    }

    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const marker = ordered ? /^\s*\d+\.\s+/ : /^\s*[-*]\s+/;
      const items = [];
      while (i < lines.length && marker.test(lines[i])) {
        let item = lines[i++].replace(marker, "");
        // indented continuation lines belong to the same item
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !marker.test(lines[i])) {
          item += " " + lines[i++].trim();
        }
        items.push(item);
      }
      blocks.push({ type: ordered ? "ol" : "ul", items });
      continue;
    }

    if (line.startsWith(">")) {
      const quote = [];
      while (i < lines.length && lines[i].startsWith(">")) quote.push(lines[i++].replace(/^>\s?/, ""));
      blocks.push({ type: "quote", text: quote.join(" ") });
      continue;
    }

    const para = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{2,3}\s|```|>|\s*[-*]\s+|\s*\d+\.\s+)/.test(lines[i])
    ) {
      para.push(lines[i++].trim());
    }
    if (para.length) blocks.push({ type: "p", text: para.join(" ") });
    else i++;
  }

  return blocks;
}

/** Plain-text version of a post, for word counts and search. */
export function stripMarkdown(source) {
  return source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*`|[\]()-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function readingTime(source) {
  const words = stripMarkdown(source).split(" ").length;
  return Math.max(1, Math.round(words / 220));
}
