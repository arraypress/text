/**
 * @arraypress/text
 *
 * Practical text utilities — truncation, slugification, and CSV escaping.
 * Designed for ecommerce admin UIs, data export, and URL generation.
 *
 * Zero dependencies. Works in any JS runtime.
 *
 * @module @arraypress/text
 */

/**
 * Truncate a string with an ellipsis.
 *
 * Supports two modes:
 * - End truncation (default): "A very long str..."
 * - Middle truncation: "pi_3abc1…789" (useful for IDs)
 *
 * @param {string} str - The string to truncate.
 * @param {number} maxLength - Maximum length including ellipsis.
 * @param {{ position?: 'end'|'middle', ellipsis?: string }} [options]
 * @returns {string} Truncated string.
 *
 * @example
 * truncate('A very long product name here', 20)
 * // 'A very long produ...'
 *
 * truncate('pi_3PBxyz123abc456def', 16, { position: 'middle' })
 * // 'pi_3PBx…456def'
 */
export function truncate(str, maxLength, options = {}) {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= maxLength) return str;

  const ellipsis = options.ellipsis ?? (options.position === 'middle' ? '…' : '...');
  const position = options.position || 'end';

  if (position === 'middle') {
    const available = maxLength - ellipsis.length;
    if (available <= 0) return ellipsis.slice(0, maxLength);
    const frontLen = Math.ceil(available / 2);
    const backLen = Math.floor(available / 2);
    return str.slice(0, frontLen) + ellipsis + str.slice(-backLen);
  }

  // End truncation
  const available = maxLength - ellipsis.length;
  if (available <= 0) return ellipsis.slice(0, maxLength);
  return str.slice(0, available) + ellipsis;
}

/**
 * Convert a string to a URL-safe slug.
 *
 * Handles Unicode by transliterating common accented characters.
 * Strips everything except letters, numbers, and hyphens.
 *
 * @param {string} str - The string to slugify.
 * @returns {string} URL-safe slug.
 *
 * @example
 * slugify('My Awesome Preset Pack!')       // 'my-awesome-preset-pack'
 * slugify('  Über Cool Synth  ')           // 'uber-cool-synth'
 * slugify('Product #1 — Best Seller!!!')   // 'product-1-best-seller'
 * slugify('Café & Résumé')                 // 'cafe-resume'
 */
export function slugify(str) {
  if (!str || typeof str !== 'string') return '';

  return str
    .normalize('NFD')                     // decompose accents: é → e + ́
    .replace(/[\u0300-\u036f]/g, '')      // strip combining diacritical marks
    .toLowerCase()
    .replace(/_/g, '-')                    // underscores → hyphens
    .replace(/[^a-z0-9\s-]/g, '')         // remove non-alphanumeric (except spaces/hyphens)
    .replace(/[\s]+/g, '-')               // spaces → hyphens
    .replace(/-+/g, '-')                  // collapse multiple hyphens
    .replace(/^-|-$/g, '');               // trim leading/trailing hyphens
}

/**
 * Escape a string for safe use in a CSV field.
 *
 * Wraps the value in double quotes if it contains commas, quotes,
 * or newlines. Escapes internal double quotes by doubling them.
 *
 * @param {string} str - The string to escape.
 * @returns {string} CSV-safe string.
 *
 * @example
 * escapeCSV('Simple value')                // 'Simple value'
 * escapeCSV('Has, comma')                  // '"Has, comma"'
 * escapeCSV('Has "quotes"')               // '"Has ""quotes"""'
 * escapeCSV('Line 1\nLine 2')             // '"Line 1\nLine 2"'
 */
export function escapeCSV(str) {
  if (!str || typeof str !== 'string') return '';
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const HTML_ESCAPES = Object.freeze({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
});

/**
 * Escape a string for safe embedding in HTML.
 *
 * Replaces `& < > " '` with their entity forms. Accepts `unknown` so
 * callers don't need to pre-coerce — `null`/`undefined` collapse to
 * the empty string and anything else is `String()`-ified first. The
 * apostrophe is escaped as `&#39;` (not `&apos;`) for maximum legacy
 * compatibility; most HTML parsers handle the numeric form reliably.
 *
 * Use this EVERY time you're interpolating user-authored data into an
 * HTML template — email bodies, server-rendered pages, OG metadata —
 * rather than hand-rolling the replace call. One canonical
 * implementation avoids the classic forget-to-escape-the-apostrophe
 * bug class.
 *
 * @param {unknown} input - Value to escape.
 * @returns {string} HTML-safe string.
 *
 * @example
 * escapeHtml('<b>Acme</b>')         // '&lt;b&gt;Acme&lt;/b&gt;'
 * escapeHtml(`O'Brien & Co`)        // 'O&#39;Brien &amp; Co'
 * escapeHtml(null)                  // ''
 */
export function escapeHtml(input) {
  if (input === null || input === undefined) return '';
  return String(input).replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

/**
 * Aggressive comparison normaliser.
 *
 * Lowercase → trim → strip every non-word / non-space character →
 * collapse runs of whitespace into single spaces. The output is
 * intended for equality comparison or deduplication, NOT for display
 * or URL generation (use `slugify` for URLs).
 *
 * Typical use: fuzzy-matching product titles and user-entered aliases
 * so `"Pro Bundle™ (2024)"` and `"pro bundle 2024"` collide. Running
 * the same normaliser on both sides of the compare keeps the match
 * engine consistent across admin UI, API, and import paths.
 *
 * @param {string} s - Input string.
 * @returns {string} Normalised form.
 *
 * @example
 * normalize('  Pro Bundle™  (2024) ')  // 'pro bundle 2024'
 * normalize('Pro—Bundle')              // 'probundle'  (em-dash stripped, no space inserted)
 * normalize('Café & Résumé')           // 'café  résumé'  (accents preserved)
 */
export function normalize(s) {
  if (!s || typeof s !== 'string') return '';
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');
}
