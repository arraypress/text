export interface TruncateOptions {
  position?: 'end' | 'middle';
  ellipsis?: string;
}

export function truncate(str: string, maxLength: number, options?: TruncateOptions): string;
export function slugify(str: string): string;
export function escapeCSV(str: string): string;

/**
 * Escape a string for safe embedding in HTML. Replaces `& < > " '`
 * with entity forms. Accepts `unknown` — `null`/`undefined` collapse
 * to `''`, anything else is `String()`-ified first.
 */
export function escapeHtml(input: unknown): string;

/**
 * Aggressive comparison normaliser — lowercase, trimmed, strips every
 * non-word/non-space character, collapses whitespace. For equality /
 * dedup checks, NOT for URLs (use `slugify` for those).
 */
export function normalize(s: string): string;
