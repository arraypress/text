import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { truncate, slugify, escapeCSV } from '../src/index.js';

// ── truncate ────────────────────────────────

describe('truncate — end (default)', () => {
  it('short string unchanged', () => assert.equal(truncate('hello', 10), 'hello'));
  it('exact length unchanged', () => assert.equal(truncate('hello', 5), 'hello'));
  it('truncates with ellipsis', () => assert.equal(truncate('hello world', 8), 'hello...'));
  it('long text', () => assert.equal(truncate('A very long product name here', 20), 'A very long produ...'));
  it('custom ellipsis', () => assert.equal(truncate('hello world', 8, { ellipsis: '…' }), 'hello w…'));
  it('null → empty', () => assert.equal(truncate(null, 10), ''));
  it('empty → empty', () => assert.equal(truncate('', 10), ''));
  it('maxLength 0', () => assert.equal(truncate('hello', 0), ''));
  it('maxLength 3 (just ellipsis)', () => assert.equal(truncate('hello world', 3), '...'));
  it('maxLength 4', () => assert.equal(truncate('hello world', 4), 'h...'));
});

describe('truncate — middle', () => {
  const opts = { position: 'middle' };
  it('short string unchanged', () => assert.equal(truncate('hello', 10, opts), 'hello'));
  it('truncates middle', () => {
    const result = truncate('pi_3PBxyz123abc456def', 16, opts);
    assert.ok(result.includes('…'));
    assert.equal(result.length, 16);
    assert.ok(result.startsWith('pi_'));
    assert.ok(result.endsWith('def'));
  });
  it('payment intent ID', () => {
    const result = truncate('pi_3abc123def456ghi789jkl', 16, opts);
    assert.equal(result.length, 16);
  });
  it('preserves start and end', () => {
    const result = truncate('abcdefghijklmnop', 10, opts);
    assert.ok(result.startsWith('abcde'));
    assert.ok(result.endsWith('mnop'));
  });
});

// ── slugify ─────────────────────────────────

describe('slugify', () => {
  const cases = [
    ['My Awesome Preset Pack!', 'my-awesome-preset-pack'],
    ['  Über Cool Synth  ', 'uber-cool-synth'],
    ['Product #1 — Best Seller!!!', 'product-1-best-seller'],
    ['Café & Résumé', 'cafe-resume'],
    ['hello world', 'hello-world'],
    ['  leading/trailing  ', 'leadingtrailing'],
    ['UPPERCASE STUFF', 'uppercase-stuff'],
    ['under_score_case', 'under-score-case'],
    ['multiple---hyphens', 'multiple-hyphens'],
    ['   spaces   everywhere   ', 'spaces-everywhere'],
    ['123 numeric start', '123-numeric-start'],
    ['naïve café résumé', 'naive-cafe-resume'],
    ['Ångström', 'angstrom'],
  ];

  for (const [input, expected] of cases) {
    it(`"${input}" → "${expected}"`, () => assert.equal(slugify(input), expected));
  }

  it('null → empty', () => assert.equal(slugify(null), ''));
  it('empty → empty', () => assert.equal(slugify(''), ''));
  it('only special chars → empty', () => assert.equal(slugify('!!!@@@###'), ''));
});

// ── escapeCSV ───────────────────────────────

describe('escapeCSV', () => {
  it('simple value unchanged', () => assert.equal(escapeCSV('hello'), 'hello'));
  it('wraps comma', () => assert.equal(escapeCSV('has, comma'), '"has, comma"'));
  it('escapes quotes', () => assert.equal(escapeCSV('has "quotes"'), '"has ""quotes"""'));
  it('wraps newline', () => assert.equal(escapeCSV('line1\nline2'), '"line1\nline2"'));
  it('wraps carriage return', () => assert.equal(escapeCSV('line1\rline2'), '"line1\rline2"'));
  it('combo: comma + quotes', () => assert.equal(escapeCSV('a, "b"'), '"a, ""b"""'));
  it('null → empty', () => assert.equal(escapeCSV(null), ''));
  it('empty → empty', () => assert.equal(escapeCSV(''), ''));
  it('number as string', () => assert.equal(escapeCSV('12345'), '12345'));
});
