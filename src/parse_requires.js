/**
 * Extract `# requires ...` directives from a Python source string.
 *
 * Supported forms (whitespace-insensitive, case-insensitive):
 * - `# requires numpy`
 * - `#requires: numpy pandas`
 * - `# requires numpy, pandas`
 *
 * Returns a de-duplicated list of module specs in first-seen order.
 */
/**
 * @param {string} code
 * @returns {string[]}
 */
export function parseRequires(code) {
  if (typeof code !== "string" || !code.length) return [];

  const modules = [];
  const seen = new Set();

  const lines = code.split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*#\s*requires\b\s*:?\s*(.*)$/i);
    if (!match) continue;

    const remainder = (match[1] ?? "").trim();
    if (!remainder) continue;

    for (const spec of remainder.split(/[,\s]+/)) {
      const cleaned = spec.trim();
      if (!cleaned) continue;
      if (seen.has(cleaned)) continue;
      seen.add(cleaned);
      modules.push(cleaned);
    }
  }

  return modules;
}
