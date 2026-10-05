export interface TruncateOptions {
  position?: 'end' | 'middle';
  ellipsis?: string;
}

export function truncate(str: string, maxLength: number, options?: TruncateOptions): string;
export function escapeCSV(str: string): string;

/**
 * Escape a string for safe embedding in HTML. Replaces `& < > " '`
 * with entity forms. Accepts `unknown` — `null`/`undefined` collapse
 * to `''`, anything else is `String()`-ified first.
 */
export function escapeHtml(input: unknown): string;

export interface GetInitialsOptions {
  /** Maximum number of characters to return. Default: 2. */
  max?: number;
}

/**
 * Returns the uppercase initials of a name. Multi-word names take the
 * first letter of each word up to `max`; single-word names use the
 * first `max` characters of the word. Empty/nullish input → `''`.
 *
 * @example
 * getInitials('David Sherlock')               // 'DS'
 * getInitials('Sean Tyas Darren', { max: 3 }) // 'STD'
 * getInitials('Dave')                         // 'DA'
 */
export function getInitials(
  name: string | undefined | null,
  opts?: GetInitialsOptions
): string;

/**
 * English `"{n} thing" / "{n} things"` pluraliser. Returns the full
 * phrase. Pass translated singular/plural for non-English locales;
 * use `Intl.PluralRules` for languages with more than two forms.
 *
 * @example
 * pluralize(1, 'item', 'items')   // '1 item'
 * pluralize(12, 'tag', 'tags')    // '12 tags'
 */
export function pluralize(n: number, singular: string, plural: string): string;

/**
 * Aggressive comparison normaliser — lowercase, trimmed, strips every
 * non-word/non-space character, collapses whitespace. For equality /
 * dedup checks, NOT for URLs (use `slugify` for those).
 */
export function normalize(s: string): string;

/**
 * Lower case and accents off, for searching. Agrees with the PHP
 * `SugarCommerce\Format\Search` fold.
 *
 * @example
 * fold('Résumé.PDF')   // 'resume.pdf'
 */
export function fold(text: string): string;

/** The words in a name or a query, folded. Non-letters/digits separate them. */
export function words(text: string): string[];

/**
 * Edit distance by code point, with a swap of neighbours counted as one
 * edit (optimal string alignment).
 *
 * @example
 * editDistance('midnigth', 'midnight')  // 1
 */
export function editDistance(a: string, b: string): number;

export interface MatchesAllOptions {
  /** Shortest query word allowed one typo. Default: 4. */
  fuzzyFrom?: number;
}

/**
 * Whether every word of a query is in a name, in any order: as a substring,
 * or (for words of `fuzzyFrom`+ characters) within one edit of a word or of
 * a word's start. An empty query matches everything.
 *
 * @example
 * matchesAll('Licence Agreement.pdf', 'license')  // true
 */
export function matchesAll(name: string, query: string, options?: MatchesAllOptions): boolean;
