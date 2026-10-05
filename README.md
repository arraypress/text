# @arraypress/text

Text utilities — truncation (end and middle), CSV + HTML escaping, monogram initials, pluralisation, and fuzzy-match normalisation.

Zero dependencies. Works in Node.js, Cloudflare Workers, Deno, Bun, and browsers.

For URL slugs with Unicode decomposition + unique-slug-against-a-store helpers, use [`@arraypress/slug`](https://github.com/arraypress/slug).

## Installation

```bash
npm install @arraypress/text
```

## Usage

```js
import {
  truncate,
  escapeCSV,
  escapeHtml,
  getInitials,
  pluralize,
  normalize,
} from '@arraypress/text';

// End truncation (default)
truncate('A very long product name here', 20)     // 'A very long produ...'

// Middle truncation (great for IDs)
truncate('pi_3abc123def456ghi789', 16, { position: 'middle' })  // 'pi_3abc…hi789'

// CSV escaping
escapeCSV('Has, comma')               // '"Has, comma"'
escapeCSV('Has "quotes"')             // '"Has ""quotes"""'

// HTML escaping
escapeHtml('<b>Acme</b>')             // '&lt;b&gt;Acme&lt;/b&gt;'
escapeHtml(`O'Brien & Co`)            // 'O&#39;Brien &amp; Co'

// Monogram / avatar initials
getInitials('David Sherlock')                // 'DS'
getInitials('Sean Tyas Darren', { max: 3 })  // 'STD'
getInitials('Dave')                          // 'DA' (single-word fallback)

// Pluralisation
pluralize(1, 'item', 'items')         // '1 item'
pluralize(12, 'tag', 'tags')          // '12 tags'

// Comparison normalisation (dedup / fuzzy match)
normalize('  Pro Bundle™  (2024) ')   // 'pro bundle 2024'
```

## API

### `truncate(str, maxLength, options?)`

Truncate a string. Options: `position` (`'end'` or `'middle'`), `ellipsis` (custom ellipsis string). Middle truncation uses `…` by default, end uses `...`.

### `escapeCSV(str)`

Escape for CSV fields. Wraps in double quotes if the value contains commas, quotes, or newlines. Doubles internal quotes.

### `escapeHtml(input)`

Escape `& < > " '` for safe embedding in HTML. Accepts `unknown` — `null`/`undefined` collapse to `''`. Use this every time you interpolate user-authored data into an HTML template.

### `getInitials(name, options?)`

Returns the uppercase initials of a name. Multi-word names take the first letter of each word up to `max` (default `2`); single-word names use the first `max` characters of the word so the avatar tile always has something to show.

Pairs naturally with `generateInitialsAvatar()` in [`@arraypress/color-utils`](https://github.com/arraypress/color-utils) to produce the actual SVG.

### `pluralize(n, singular, plural)`

English `"{n} thing" / "{n} things"` pluraliser. Returns the full phrase (count + word). For non-English locales pass the translated singular + plural; use `Intl.PluralRules` for languages with more than two plural forms.

### `normalize(str)`

Aggressive comparison normaliser — lowercase → trim → strip non-word/non-space → collapse whitespace. For equality and dedup checks, **not** for URLs (use `@arraypress/slug` for those).

## Search

Somebody searching a list of files remembers roughly what a thing is called, not how it was spelled the day it was saved: "license" for "Licence Agreement.pdf", "drive master" for "Midnight Drive - Master.wav". These four functions are that search, with the same rules as the PHP `SugarCommerce\Format\Search`, so a list filtered in the browser and one filtered on the server find the same things.

```js
import { matchesAll, editDistance, words, fold } from '@arraypress/text';

matchesAll('Licence Agreement.pdf', 'license')              // true — one letter out
matchesAll('Midnight Drive - Master.wav', 'master drive')   // true — any order
matchesAll('Midnight Drive - Master.wav', 'midnigth')       // true — a swap is one edit
matchesAll('Neon Rain - Master.wav', 'way')                 // false — too short to guess at

editDistance('midnigth', 'midnight')   // 1 (Levenshtein says 2)
words('Midnight Drive - Master.wav')   // ['midnight', 'drive', 'master', 'wav']
fold('Résumé.PDF')                     // 'resume.pdf'
```

### `matchesAll(name, query, options?)`

Every word of the query must be in the name, in any order: as part of it, or — for words of `fuzzyFrom` characters or more (default `4`) — within one edit of a word of the name or of that word's start, so "licens" finds "Licence" before the word is finished. An empty query matches everything.

### `editDistance(a, b)`

Edit distance by code point (an accented letter is one character, not two bytes), counting a swap of two neighbours as one edit — optimal string alignment. The commonest typing slip is two letters the wrong way round, and plain Levenshtein counts that as two edits, past the one a search forgives.

### `words(text)` / `fold(text)`

`fold` lower-cases and strips accents (NFD, combining marks dropped); `words` splits the folded text on anything that is not a letter or digit, in any script.

## Testing

```bash
npm test
```

73 tests, including the search cases the PHP twin runs.

## License

MIT
