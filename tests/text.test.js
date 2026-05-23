import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  truncate,
  escapeCSV,
  escapeHtml,
  getInitials,
  pluralize,
  normalize,
} from '../src/index.js';

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

// ── getInitials ─────────────────────────────

describe('getInitials', () => {
  it('multi-word default (max 2)', () => assert.equal(getInitials('David Sherlock'), 'DS'));
  it('three-word max 2', () => assert.equal(getInitials('Sean Tyas Darren'), 'ST'));
  it('three-word max 3', () =>
    assert.equal(getInitials('Sean Tyas Darren', { max: 3 }), 'STD'));
  it('single-word fallback uses first N chars', () =>
    assert.equal(getInitials('Dave'), 'DA'));
  it('single-word max 3', () =>
    assert.equal(getInitials('Dave', { max: 3 }), 'DAV'));
  it('single-word shorter than max', () =>
    assert.equal(getInitials('Al', { max: 3 }), 'AL'));
  it('trims whitespace', () =>
    assert.equal(getInitials('  spaces   trimmed  '), 'ST'));
  it('collapses multi-space runs', () =>
    assert.equal(getInitials('A\tB\nC', { max: 3 }), 'ABC'));
  it('null → empty', () => assert.equal(getInitials(null), ''));
  it('undefined → empty', () => assert.equal(getInitials(undefined), ''));
  it('empty → empty', () => assert.equal(getInitials(''), ''));
  it('all whitespace → empty', () => assert.equal(getInitials('   '), ''));
  it('uppercases mixed-case names', () =>
    assert.equal(getInitials('david sherlock'), 'DS'));
});

// ── pluralize ───────────────────────────────

describe('pluralize', () => {
  it('1 → singular', () => assert.equal(pluralize(1, 'item', 'items'), '1 item'));
  it('0 → plural', () => assert.equal(pluralize(0, 'item', 'items'), '0 items'));
  it('2 → plural', () => assert.equal(pluralize(2, 'tag', 'tags'), '2 tags'));
  it('large number', () =>
    assert.equal(pluralize(1234, 'post', 'posts'), '1234 posts'));
  it('negative count uses plural (treats !==1 as plural)', () =>
    assert.equal(pluralize(-1, 'item', 'items'), '-1 items'));
  it('translated words pass through', () =>
    assert.equal(pluralize(3, 'élément', 'éléments'), '3 éléments'));
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
