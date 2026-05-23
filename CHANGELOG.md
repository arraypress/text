# Changelog

All notable changes to `@arraypress/text` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] — Unreleased

### Added

- `getInitials(name, { max? })` — uppercase monogram for fallback avatars / tile placeholders. Handles multi-word names (first letter of each) and single-word names (first N characters) so the tile always has something to show. Pairs with `generateInitialsAvatar()` in `@arraypress/color-utils` for the SVG side.
- `pluralize(n, singular, plural)` — English `"{n} thing" / "{n} things"` pluraliser. Returns the full phrase so call sites collapse to one expression. Pass translated singular/plural for non-English locales; use `Intl.PluralRules` for languages with more than two plural forms.

### Fixed

- Removed dead `slugify` reference from the test suite (`slugify` lives in [`@arraypress/slug`](https://github.com/arraypress/slug) — tests now import only what's actually exported).
