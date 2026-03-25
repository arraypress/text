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
