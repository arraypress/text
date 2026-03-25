# @arraypress/text

Text utilities — truncation (end and middle), slugification with Unicode support, and CSV escaping.

Zero dependencies. Works in Node.js, Cloudflare Workers, Deno, Bun, and browsers.

## Installation

```bash
npm install @arraypress/text
```

## Usage

```js
import { truncate, slugify, escapeCSV } from '@arraypress/text';

// End truncation (default)
truncate('A very long product name here', 20)     // 'A very long produ...'

// Middle truncation (great for IDs)
truncate('pi_3abc123def456ghi789', 16, { position: 'middle' })  // 'pi_3abc…hi789'

// Slugify with Unicode handling
slugify('My Awesome Preset Pack!')    // 'my-awesome-preset-pack'
slugify('Café & Résumé')              // 'cafe-resume'
slugify('Über Cool Synth')            // 'uber-cool-synth'

// CSV escaping
escapeCSV('Simple value')             // 'Simple value'
escapeCSV('Has, comma')               // '"Has, comma"'
escapeCSV('Has "quotes"')            // '"Has ""quotes"""'
```

## API

### `truncate(str, maxLength, options?)`

Truncate a string. Options: `position` (`'end'` or `'middle'`), `ellipsis` (custom ellipsis string). Middle truncation uses `…` by default, end uses `...`.

### `slugify(str)`

Convert to a URL-safe slug. Handles Unicode by decomposing accented characters (NFD normalization). Strips non-alphanumeric characters, collapses hyphens.

### `escapeCSV(str)`

Escape for CSV fields. Wraps in double quotes if the value contains commas, quotes, or newlines. Doubles internal quotes.

## License

MIT
