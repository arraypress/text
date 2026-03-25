export interface TruncateOptions {
  position?: 'end' | 'middle';
  ellipsis?: string;
}

export function truncate(str: string, maxLength: number, options?: TruncateOptions): string;
export function slugify(str: string): string;
export function escapeCSV(str: string): string;
