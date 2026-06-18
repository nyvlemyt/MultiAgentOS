<!-- pattern from affaan-m/ecc rules/perl/security.md -->
---
origin: affaan-m/ecc
license: MIT
lang: perl
concern: security
---
# Perl Security

## Taint Mode
- Use the `-T` flag on all CGI/web-facing scripts.
- Sanitize `%ENV` (`$ENV{PATH}`, `$ENV{CDPATH}`, …) before any external command.

## Input Validation
- Allowlist regex for untainting — never `/(.*)/s`.

```perl
if ($input =~ /\A([a-zA-Z0-9_-]+)\z/) {
    my $clean = $1;
}
```

## File I/O
- Three-arg `open` only. Prevent path traversal with `Cwd::realpath`:

```perl
use Cwd 'realpath';
my $safe_path = realpath($user_path);
die "Path traversal" unless $safe_path =~ m{\A/allowed/directory/};
```

## Process Execution
- List-form `system()` — never single-string. Use **IPC::Run3** to capture output. Never backticks with interpolation.

```perl
system('grep', '-r', $pattern, $directory);  # safe
```

## SQL Injection Prevention
Always use DBI placeholders — never interpolate into SQL.

```perl
my $sth = $dbh->prepare('SELECT * FROM users WHERE email = ?');
$sth->execute($email);
```

## Security Scanning
```bash
perlcritic --severity 4 --theme security lib/
```

## Verification
- [ ] Web-facing scripts run under `-T`; input untainted via allowlist regex.
- [ ] Three-arg open + realpath guards; list-form `system()` only.
- [ ] All SQL via placeholders; perlcritic security theme (sev 4) clean.
