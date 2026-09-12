/**
 * Resolve what a readable element should say. Priority:
 * 1. data-speak-text (authored, already in the active language)
 * 2. aria-label
 * 3. carefully sanitised visible text
 *
 * Raw innerText is deliberately the last resort: it duplicates nested labels,
 * picks up icons and includes hidden content.
 */
const SKIP_SELECTOR = "svg, img, [aria-hidden='true'], .sr-only, [hidden], script, style";

export function getSpeakText(element: HTMLElement, language: "hi" | "en"): string {
  const localised = element.getAttribute(`data-speak-text-${language}`);
  if (localised) return localised.trim();

  const authored = element.getAttribute("data-speak-text");
  if (authored) return authored.trim();

  const label = element.getAttribute("aria-label");
  if (label) return label.trim();

  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) {
    const parts = labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent?.trim() ?? "")
      .filter(Boolean);
    if (parts.length) return parts.join(", ");
  }

  const clone = element.cloneNode(true) as HTMLElement;
  clone.querySelectorAll(SKIP_SELECTOR).forEach((node) => node.remove());
  // Drop nested readable elements: they speak for themselves on their own hover.
  clone.querySelectorAll("[data-speak]").forEach((node) => node.remove());

  const seen = new Set<string>();
  const text = (clone.textContent ?? "")
    .split(/\s*\n\s*/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => {
      if (!line) return false;
      const key = line.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join(". ");

  return text.replace(/\s+/g, " ").trim();
}
