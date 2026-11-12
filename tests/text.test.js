import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  truncate,
  escapeCSV,
  escapeHtml,
  getInitials,
  pluralize,
  normalize,
  fold,
  words,
  editDistance,
  firstLine,
  matchesAll,
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

describe('truncate — whole characters, never longer than asked', () => {
  it('an emoji is not cut in two', () => {
    assert.equal(truncate('😀😀😀😀😀', 4), '...');
    assert.equal(truncate('😀😀😀😀😀', 5), '😀...');
    assert.equal(truncate('😀😀😀😀😀', 6, { position: 'middle' }), '😀…😀');
    for (const max of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      for (const position of /** @type {const} */ (['end', 'middle'])) {
        const cut = truncate('a😀b😀c😀d😀', max, { position });
        assert.ok(cut.isWellFormed() && cut.length <= max, `${position} ${max}: ${cut}`);
      }
    }
  });
  it('the middle with room for one character keeps one', () => {
    assert.equal(truncate('abcdefghij', 2, { position: 'middle' }), 'a…');
    assert.equal(truncate('abcdefghij', 2, { position: 'middle', ellipsis: '.' }), 'a.');
    assert.equal(truncate('abcdefghij', 3, { position: 'middle' }), 'a…j');
  });
  it('a negative length is nothing', () => assert.equal(truncate('abc', -1), ''));
});

describe('truncate — middle', () => {
  const opts = { position: /** @type {const} */ ('middle') };
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
  it('an initial is a whole character', () => {
    assert.equal(getInitials('😀 Smile'), '😀S');
    assert.equal(getInitials('𝒜lice'), '𝒜L');
    assert.equal(getInitials('李 小龍'), '李小');
  });
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
  it('a number or a boolean is written as it prints', () => {
    assert.equal(escapeCSV(/** @type {any} */ (0)), '0');
    assert.equal(escapeCSV(/** @type {any} */ (12.5)), '12.5');
    assert.equal(escapeCSV(/** @type {any} */ (false)), 'false');
  });
  it('wraps comma', () => assert.equal(escapeCSV('has, comma'), '"has, comma"'));
  it('escapes quotes', () => assert.equal(escapeCSV('has "quotes"'), '"has ""quotes"""'));
  it('wraps newline', () => assert.equal(escapeCSV('line1\nline2'), '"line1\nline2"'));
  it('wraps carriage return', () => assert.equal(escapeCSV('line1\rline2'), '"line1\rline2"'));
  it('combo: comma + quotes', () => assert.equal(escapeCSV('a, "b"'), '"a, ""b"""'));
  it('null → empty', () => assert.equal(escapeCSV(null), ''));
  it('empty → empty', () => assert.equal(escapeCSV(''), ''));
  it('number as string', () => assert.equal(escapeCSV('12345'), '12345'));
});

// ── fuzzy search ────────────────────────────
// The same cases as SugarCommerce\Format\Search's PHP tests, so the browser
// and the server find the same things.

describe('fold / words', () => {
  it('lower case, accents off', () => assert.equal(fold('Résumé.PDF'), 'resume.pdf'));
  it('nullish → empty', () => assert.equal(fold(null), ''));
  it('splits on anything not a letter or digit', () =>
    assert.deepEqual(words('Midnight Drive - Master.wav'), ['midnight', 'drive', 'master', 'wav']));
  it('keeps other scripts', () => assert.deepEqual(words('Ünïcode—テスト 2'), ['unicode', 'テスト', '2']));
  it('nothing to split → no words', () => assert.deepEqual(words(' - '), []));
  it('keeps the marks that spell words: Hindi, Bengali, Thai, Tamil, Japanese', () => {
    assert.deepEqual(words('हिंदी भाषा'), ['हिंदी', 'भाषा']);
    assert.deepEqual(words('বাংলা ভাষা'), ['বাংলা', 'ভাষা']);
    assert.deepEqual(words('தமிழ் மொழி'), ['தமிழ்', 'மொழி']);
    assert.equal(fold('ไทย ที่นี่'), 'ไทย ที่นี่');
    assert.equal(fold('がっこう'), 'がっこう');
    assert.equal(fold('한국어'), '한국어');
  });
  it('drops the accents and points searching can do without, decomposed or not', () => {
    assert.equal(fold('Ünïcode'), 'unicode');
    assert.equal(fold('re\u0301sume\u0301'), 'resume');
    assert.equal(fold('Ελλάδα'), 'ελλαδα');
    assert.equal(fold('Ёлка'), 'елка');
    assert.equal(fold('שָׁלוֹם'), 'שלום');
    assert.equal(fold('مُحَمَّد'), 'محمد');
    assert.equal(fold('\u0301'), '');
  });
  it('a search in Hindi or Japanese finds its own word only', () => {
    assert.equal(matchesAll('हिंदी भाषा', 'हिंदी'), true);
    assert.equal(matchesAll('हद', 'हिंदी'), false);
    assert.equal(matchesAll('かっこう', 'がっこう', { fuzzyFrom: Infinity }), false);
    assert.equal(matchesAll('がっこう', 'がっこう'), true);
  });
});

describe('editDistance', () => {
  const cases = [
    ['same', 'rain', 'rain', 0],
    ['swap', 'rian', 'rain', 1],
    ['swap at the end', 'midnigth', 'midnight', 1],
    ['substitution', 'rein', 'rain', 1],
    ['insertion', 'rains', 'rain', 1],
    ['deletion', 'ran', 'rain', 1],
    ['empty', '', 'rain', 4],
    ['no edit of a swap (OSA, not Damerau)', 'ca', 'abc', 3],
    ['a letter, not bytes', 'résumé', 'resume', 2],
    ['two swaps', 'abdc', 'bacd', 2],
  ];

  for (const [label, a, b, expected] of /** @type {[string, string, string, number][]} */ (cases)) {
    it(label, () => {
      assert.equal(editDistance(a, b), expected);
      assert.equal(editDistance(b, a), expected);
    });
  }
});

describe('matchesAll', () => {
  const library = [
    'Midnight Drive - Instrumental.wav',
    'Licence Agreement.pdf',
    'Midnight Drive - Master.wav',
    'Midnight Drive - Stems.zip',
    'Read Me First.txt',
    'Midnight Drive - Artwork.png',
    'Neon Rain - Master.wav',
    'Résumé.pdf',
  ];
  /** @param {string} query */
  const find = (query) => library.filter((name) => matchesAll(name, query));

  it('the other spelling', () => assert.deepEqual(find('License'), ['Licence Agreement.pdf']));
  it('half typed', () => assert.deepEqual(find('licens'), ['Licence Agreement.pdf']));
  it('any case', () => assert.deepEqual(find('LICENCE'), ['Licence Agreement.pdf']));
  it('words in any order', () => assert.deepEqual(find('master drive'), ['Midnight Drive - Master.wav']));
  it('every word must be there', () => assert.deepEqual(find('neon drive'), []));
  it('a typo in each word', () => assert.deepEqual(find('midnigt mastr'), ['Midnight Drive - Master.wav']));
  it('part of a word', () => assert.deepEqual(find('strum'), ['Midnight Drive - Instrumental.wav']));
  it('the extension', () => assert.deepEqual(find('.zip'), ['Midnight Drive - Stems.zip']));
  it('without the accents', () => assert.deepEqual(find('resume'), ['Résumé.pdf']));
  it('no guessing when short', () => assert.deepEqual(find('way'), []));
  it('nothing like it', () => assert.deepEqual(find('invoice'), []));
  it('two letters swapped', () => assert.deepEqual(find('midnigth'), [
    'Midnight Drive - Instrumental.wav', 'Midnight Drive - Master.wav', 'Midnight Drive - Stems.zip', 'Midnight Drive - Artwork.png',
  ]));
  it('swapped in a short word', () => assert.deepEqual(find('rian'), ['Neon Rain - Master.wav']));
  it('swapped while typing', () => assert.deepEqual(find('licnece'), ['Licence Agreement.pdf']));
  it('an empty query matches everything', () => assert.equal(find('').length, library.length));
  it('fuzzyFrom is adjustable', () => assert.equal(matchesAll('Neon Rain.wav', 'rian', { fuzzyFrom: 5 }), false));
});

describe('firstLine', () => {
  it('the first line with anything on it, trimmed', () => {
    assert.equal(firstLine('\n  Hi Sam,\nThanks for…'), 'Hi Sam,');
    assert.equal(firstLine('One line'), 'One line');
  });
  it('empty for blank text, null or undefined', () => {
    assert.equal(firstLine('   \n\t\n'), '');
    assert.equal(firstLine(null), '');
    assert.equal(firstLine(undefined), '');
  });
});

describe('escapeHtml', () => {
  it('escapes the five characters HTML cares about', () => {
    assert.equal(escapeHtml(`<b class="x">O'Brien & Co</b>`), '&lt;b class=&quot;x&quot;&gt;O&#39;Brien &amp; Co&lt;/b&gt;');
  });
  it('null and undefined are empty; anything else is a string first', () => {
    assert.equal(escapeHtml(null), '');
    assert.equal(escapeHtml(undefined), '');
    assert.equal(escapeHtml(42), '42');
  });
});

describe('normalize', () => {
  it('lower case, trimmed, punctuation gone, spaces collapsed', () => {
    assert.equal(normalize('  Hello,   World! '), 'hello world');
  });
  it('empty for anything but a string', () => assert.equal(normalize(/** @type {any} */ (null)), ''));
  it('keeps the letters of every script', () => {
    assert.equal(normalize('Café & Résumé'), 'café résumé');
    assert.equal(normalize('Müller GmbH™'), 'müller gmbh');
    assert.equal(normalize('日本語 (テスト)'), '日本語 テスト');
    assert.equal(normalize('हिंदी!'), 'हिंदी');
  });
});
