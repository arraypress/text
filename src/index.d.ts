/**
 * @arraypress/text
 *
 * Practical text utilities — truncation, CSV and HTML escaping, initials,
 * plurals, first lines, and accent-blind, typo-tolerant search.
 * Designed for ecommerce admin UIs, data export, and URL generation.
 *
 * Zero dependencies. Works in any JS runtime.
 *
 * @module @arraypress/text
 */
export type TruncateOptions = {
    /**
     * Where the ellipsis goes. Default `'end'`.
     */
    position?: 'end' | 'middle';
    /**
     * What marks the cut. Default `'...'` at the end, `'…'` in the middle.
     */
    ellipsis?: string;
};
export type GetInitialsOptions = {
    /**
     * Maximum number of characters to return. Default 2.
     */
    max?: number;
};
export type MatchesAllOptions = {
    /**
     * Shortest word allowed a typo. Default 4.
     */
    fuzzyFrom?: number;
};
/**
 * Truncate a string with an ellipsis.
 *
 * Supports two modes:
 * - End truncation (default): "A very long str..."
 * - Middle truncation: "pi_3abc1…789" (useful for IDs)
 *
 * @param {string | null | undefined} str - The string to truncate.
 * @param {number} maxLength - Maximum length including ellipsis.
 * @param {TruncateOptions} [options]
 * @returns {string} Truncated string.
 *
 * @example
 * truncate('A very long product name here', 20)
 * // 'A very long produ...'
 *
 * truncate('pi_3PBxyz123abc456def', 16, { position: 'middle' })
 * // 'pi_3PBx…456def'
 */
export declare function truncate(str: string | null | undefined, maxLength: number, options?: TruncateOptions): string;
/**
 * Escape a string for safe use in a CSV field.
 *
 * Wraps the value in double quotes if it contains commas, quotes,
 * or newlines. Escapes internal double quotes by doubling them.
 *
 * @param {string | number | boolean | null | undefined} str - The value to escape; a number or a
 *   boolean is written as it prints.
 * @returns {string} CSV-safe string.
 *
 * @example
 * escapeCSV('Simple value')                // 'Simple value'
 * escapeCSV('Has, comma')                  // '"Has, comma"'
 * escapeCSV('Has "quotes"')               // '"Has ""quotes"""'
 * escapeCSV('Line 1\nLine 2')             // '"Line 1\nLine 2"'
 * escapeCSV(0)                             // '0'
 */
export declare function escapeCSV(str: string | number | boolean | null | undefined): string;
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
export declare function escapeHtml(input: unknown): string;
/**
 * Returns the uppercase initials of a name. Handles both multi-word
 * and single-word inputs gracefully.
 *
 * Multi-word names take the first letter of each word, up to `max`.
 * Single-word names use the first `max` characters of the word so
 * the avatar tile always has something to show (`"Dave"` → `"DA"`
 * rather than `"D"`).
 *
 * Typical use: monogram tiles / fallback avatars on cards, author
 * blocks, testimonials — anything that needs a placeholder when no
 * image is available. Paired with the `generateInitialsAvatar()`
 * helper in `@arraypress/color-utils` to render the actual SVG.
 *
 * @param {string|undefined|null} name - The full name (or any noun phrase).
 * @param {GetInitialsOptions} [opts] - Configuration. `max` defaults to `2`.
 * @returns {string} Initials, uppercase. Empty string for empty input.
 *
 * @example
 * getInitials('David Sherlock')               // 'DS'
 * getInitials('Sean Tyas Darren', { max: 3 }) // 'STD'
 * getInitials('Dave')                         // 'DA' (single-word fallback)
 * getInitials('  spaces   trimmed ')          // 'ST'
 * getInitials('')                             // ''
 * getInitials(undefined)                      // ''
 */
export declare function getInitials(name: string | undefined | null, opts?: GetInitialsOptions): string;
/**
 * English pluralisation helper for `"{n} thing" / "{n} things"`
 * patterns. Returns the FULL phrase (count + word) so the call
 * site collapses to a single expression:
 *
 *   pluralize(1, 'post', 'posts')   // '1 post'
 *   pluralize(12, 'post', 'posts')  // '12 posts'
 *   pluralize(0, 'item', 'items')   // '0 items'
 *
 * For non-English locales pass the translated singular + plural;
 * this helper doesn't pretend to know your language's plural
 * rules. Languages with more than two plural forms (Russian,
 * Polish, Arabic, …) need `Intl.PluralRules`.
 *
 * @param {number} n - The count.
 * @param {string} singular - Word for n === 1.
 * @param {string} plural - Word for anything else.
 * @returns {string} `"<n> <word>"` — full phrase.
 *
 * @example
 * pluralize(1, 'item', 'items')     // '1 item'
 * pluralize(0, 'result', 'results') // '0 results'
 * pluralize(7, 'tag', 'tags')       // '7 tags'
 */
export declare function pluralize(n: number, singular: string, plural: string): string;
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
 * @param {string | null | undefined} s - Input string.
 * @returns {string} Normalised form.
 *
 * @example
 * normalize('  Pro Bundle™  (2024) ')  // 'pro bundle 2024'
 * normalize('Pro—Bundle')              // 'probundle'  (em-dash stripped, no space inserted)
 * normalize('Café & Résumé')           // 'café résumé'  (letters of every script kept)
 */
export declare function normalize(s: string | null | undefined): string;
/**
 * Fold text for searching: lower case, and accents off — so "résumé" is
 * found by "resume".
 *
 * Decomposes to NFD and drops the accents (the PHP twin,
 * `SugarCommerce\Format\Search`, drops every combining mark with the intl
 * extension, and agrees for Latin, Greek and Cyrillic). The marks that
 * spell a word stay, recomposed: a Hindi or Thai vowel sign, a kana's
 * voicing mark. Dropping those made "हिंदी" the letters "हद" and "が" a "か".
 *
 * @param {string | null | undefined} text - Name or query.
 * @returns {string} Folded text.
 *
 * @example
 * fold('Résumé.PDF')   // 'resume.pdf'
 * fold('がっこう')       // 'がっこう'
 */
export declare function fold(text: string | null | undefined): string;
/**
 * The words in a name or a query, folded. Anything that is not a letter, a
 * digit or a mark that spells a word, in any script, separates words.
 *
 * @param {string | null | undefined} text - Name or query.
 * @returns {string[]} Words, in order, none empty.
 *
 * @example
 * words('Midnight Drive - Master.wav')  // ['midnight', 'drive', 'master', 'wav']
 */
export declare function words(text: string | null | undefined): string[];
/**
 * Edit distance by character (code point), counting a swap of two
 * neighbouring characters as one edit — optimal string alignment.
 *
 * Plain Levenshtein calls "midnigth" two edits from "midnight", but the
 * commonest typing slip is exactly that swap, so a search forgiving one edit
 * missed the file the person plainly meant. Optimal string alignment edits
 * each part once: "ca" → "abc" is 3 (unrestricted Damerau says 2).
 *
 * @param {string} a - One word.
 * @param {string} b - The other.
 * @returns {number} Edits between them.
 *
 * @example
 * editDistance('midnigth', 'midnight')  // 1
 * editDistance('résumé', 'resume')      // 2
 */
export declare function editDistance(a: string, b: string): number;
/**
 * Whether every word of a query is in a name: in any order, as part of the
 * name, or — for words of `fuzzyFrom` characters or more — within one edit
 * of a word of the name or of its start, so "licens" finds "Licence" while
 * it is still being typed.
 *
 * The same rules as `SugarCommerce\Format\Search` in PHP, so a list
 * filtered in the browser and one filtered on the server agree.
 *
 * @param {string} name - What is searched, e.g. a filename.
 * @param {string} query - What was typed. An empty query matches everything.
 * @param {MatchesAllOptions} [options] - Shortest word allowed a typo.
 *   Default 4: below that one wrong letter is a different word ("wav", "way").
 * @returns {boolean}
 *
 * @example
 * matchesAll('Licence Agreement.pdf', 'license')               // true
 * matchesAll('Midnight Drive - Master.wav', 'mastr midnigth')  // true
 * matchesAll('Neon Rain - Master.wav', 'way')                  // false
 */
export declare function matchesAll(name: string, query: string, options?: MatchesAllOptions): boolean;
/**
 * The first line of a text that has anything on it, trimmed: what a list
 * row shows for a long note or template ("Hi {name}," for a reply that
 * starts with a blank line).
 *
 * @param {string | null | undefined} text - Any text; `null` and `undefined` read as empty.
 * @returns {string} The first non-blank line, trimmed, or `''` when there is none.
 *
 * @example
 * firstLine('\n  Hi Sam,\nThanks for…')  // 'Hi Sam,'
 * firstLine('   ')                        // ''
 */
export declare function firstLine(text: string | null | undefined): string;
