<!-- pattern from affaan-m/ecc rules/perl/patterns.md -->
---
origin: affaan-m/ecc
license: MIT
lang: perl
concern: patterns
---
# Perl Patterns

## Repository Pattern
Use **DBI** or **DBIx::Class** behind an interface; parameterized queries throughout.

```perl
package MyApp::Repo::User;
use Moo;
has dbh => (is => 'ro', required => 1);

sub find_by_id ($self, $id) {
    my $sth = $self->dbh->prepare('SELECT * FROM users WHERE id = ?');
    $sth->execute($id);
    return $sth->fetchrow_hashref;
}
```

## DTOs / Value Objects
Use **Moo** classes with **Types::Standard** (the Perl equivalent of dataclasses).

```perl
package MyApp::DTO::User;
use Moo;
use Types::Standard qw(Str Int);
has name  => (is => 'ro', isa => Str, required => 1);
has email => (is => 'ro', isa => Str, required => 1);
has age   => (is => 'ro', isa => Int);
```

## Resource Management
- Always three-arg `open` with `autodie`; use **Path::Tiny** for file ops.

```perl
use autodie;
use Path::Tiny;
my $content = path('config.json')->slurp_utf8;
```

## Module Interface
Use `Exporter 'import'` with `@EXPORT_OK` — never `@EXPORT`.

## Dependency Management
**cpanfile** + **carton** for reproducible installs:

```bash
carton install
carton exec prove -lr t/
```

## Verification
- [ ] Data access behind a repo class using DBI placeholders.
- [ ] DTOs are Moo + Types::Standard; file I/O via Path::Tiny + autodie.
- [ ] Exports via `@EXPORT_OK`; deps pinned with cpanfile + carton.
