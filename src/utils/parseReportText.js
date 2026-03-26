/**
 * Parses a flat AI-generated report string into named sections.
 * Returns an object: { sectionKey: "content string", ... }
 * Also returns `_raw` with the full text and `_unparsed` with leftover lines.
 */

/**
 * Strips metric claims from report text when scraper data is unavailable.
 * Never replaces with zeros or assumptions — just removes unverifiable lines.
 */
export function sanitizeReportText(text, dataConfidence, isPersonal) {
  if (!text || dataConfidence === "combined") return text;

  const lines = text.split("\n");
  const cleaned = lines.filter((line) => {
    const l = line.toLowerCase();

    // Remove any line that pairs a specific number with a metric term
    // e.g. "1,200 followers", "0 likes", "3.2% engagement rate"
    if (/\d[\d,.]*(k|m)?\s*(followers|likes|comments|shares|views|reach|impressions|engagement rate|reactions)/.test(l)) return false;
    if (/(followers|likes|comments|shares|views|reach|impressions).*\d[\d,.]*/.test(l)) return false;

    // Remove lines that explicitly claim zero values for metrics
    if (/\b0\s*(followers|likes|comments|shares|views|reach)/.test(l)) return false;

    // For personal profiles, remove page-only field references if they're stated as facts
    if (isPersonal) {
      if (/page (category|verification|intro|about section)/.test(l)) return false;
      if (/verified (page|badge)/.test(l)) return false;
    }

    return true;
  });

  return cleaned.join("\n");
}

const SECTION_MAP = [
  { key: "overview",         patterns: ["personalized overview", "overview"] },
  { key: "analyzed",         patterns: ["what we analyzed", "what was analyzed", "analyzed"] },
  { key: "visibility",       patterns: ["visibility analysis", "visibility"] },
  { key: "engagement",       patterns: ["engagement analysis", "engagement"] },
  { key: "blockers",         patterns: ["growth blockers", "top 3 growth blockers", "blockers", "obstacles"] },
  { key: "strengths",        patterns: ["top 3 strengths", "strengths", "what you're doing well"] },
  { key: "sevenDayPlan",     patterns: ["7-day action plan", "7 day action plan", "seven day plan", "7-day plan", "action plan"] },
  { key: "postIdeas",        patterns: ["3 specific post ideas", "specific post ideas", "post ideas", "content ideas"] },
  { key: "thirtyDayStrategy",patterns: ["30-day strategy", "30 day strategy", "strategy summary", "30-day summary"] },
];

function normalizeHeading(line) {
  return line
    .toLowerCase()
    .replace(/^[#\-*\d.]+\s*/, "")   // strip markdown / numbering
    .replace(/[:\-–—]+$/, "")        // strip trailing punctuation
    .trim();
}

function matchSection(heading) {
  const norm = normalizeHeading(heading);
  for (const sec of SECTION_MAP) {
    if (sec.patterns.some((p) => norm.includes(p))) return sec.key;
  }
  return null;
}

function isHeadingLine(line) {
  const t = line.trim();
  if (!t) return false;
  if (/^#{1,4}\s/.test(t)) return true;                          // markdown heading
  if (/^[A-Z][A-Z\s\d\-:]{4,}$/.test(t)) return true;          // ALL CAPS line
  if (/^\d{1,2}[\.\)]\s+[A-Z]/.test(t)) return true;           // "1. Heading"
  if (/^[*\-]{1,2}\s*[A-Z][A-Z\s]{4,}/.test(t)) return true;  // "- HEADING"
  return false;
}

export function parseReportText(text) {
  if (!text || typeof text !== "string") return { _raw: "", _unparsed: "" };

  const lines = text.split("\n");
  const sections = { _raw: text };
  let currentKey = null;
  let currentLines = [];
  let unparsedLines = [];

  const flush = () => {
    if (!currentKey) {
      unparsedLines.push(...currentLines);
    } else {
      const content = currentLines.join("\n").trim();
      if (content) {
        sections[currentKey] = sections[currentKey]
          ? sections[currentKey] + "\n\n" + content
          : content;
      }
    }
    currentLines = [];
  };

  for (const line of lines) {
    if (isHeadingLine(line)) {
      flush();
      const matched = matchSection(line);
      currentKey = matched;
      // don't push the heading itself into content
    } else {
      currentLines.push(line);
    }
  }
  flush();

  sections._unparsed = unparsedLines.join("\n").trim();
  return sections;
}

/** Render a section string as an array of bullet strings (lines starting with - * •) or paragraphs */
export function extractBullets(text) {
  if (!text) return [];
  return text
    .split("\n")
    .map((l) => l.replace(/^[\-\*•]\s*/, "").trim())
    .filter(Boolean);
}

/** Extract numbered day items from a plan section */
export function extractDayItems(text) {
  if (!text) return [];
  const items = [];
  const lines = text.split("\n").filter(Boolean);
  let current = null;
  for (const line of lines) {
    const dayMatch = line.match(/^(?:day\s*)?(\d{1,2})[\.\):\-–]?\s+(.+)/i);
    if (dayMatch) {
      if (current) items.push(current);
      current = { day: parseInt(dayMatch[1]), action: dayMatch[2].trim(), example: "" };
    } else if (current) {
      const clean = line.replace(/^[\-\*•]\s*/, "").trim();
      if (clean) current.example += (current.example ? " " : "") + clean;
    } else {
      items.push({ day: items.length + 1, action: line.replace(/^[\-\*•\d.]+\s*/, "").trim(), example: "" });
    }
  }
  if (current) items.push(current);
  return items;
}