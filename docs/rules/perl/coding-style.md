<!-- pattern from affaan-m/ecc rules/perl/coding-style.md -->
---
origin: affaan-m/ecc
license: MIT
lang: perl
concern: coding-style
---
# Perl Coding Style

## Standards
- Always `use v5.36` (enables `strict`, `warnings`, `say`, subroutine signatures).
- Use subroutine signatures — never unpack `@_` manually.
- Prefer `say` over `print` with explicit newlines.

## Immutability
- Use **Moo** with `is => 'ro'` and `Types::Standard` for all attributes.
- Never use blessed hashrefs directly — always use Moo/Moose accessors.
- Moo `has` attributes with `builder`/`default` are fine for computed read-only values.

## Formatting (perltidy)
```
-i=4    # 4-space indent
-l=100  # 100 char line length
-ce     # cuddled else
-bar    # opening brace always right
```

## Linting (perlcritic)
Severity 3 with themes `core`, `pbp`, `security`:

```bash
perlcritic --severity 3 --theme 'core || pbp || security' lib/
```

## Verification
- [ ] Every file declares `use v5.36`; subs use signatures.
- [ ] Attributes are Moo `ro` with `Types::Standard`; no raw blessed hashrefs.
- [ ] perltidy and perlcritic (sev 3) clean.
