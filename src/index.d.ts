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
