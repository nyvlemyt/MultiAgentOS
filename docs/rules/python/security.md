---
origin: affaan-m/ecc
license: MIT
lang: python
concern: security
---
<!-- pattern from affaan-m/ecc rules/python/security.md -->

# Python — Security (reference)

Aligns with MultiAgentOS §11 (secrets never committed; provider keys live in gitignored `.env.local`; Anthropic-PAYG via `@anthropic-ai/sdk` is forbidden).

## Secret management

Load secrets from the environment and fail fast if missing. Use a neutral, app-specific key name — never imply a paid-provider default:

```python
import os
from dotenv import load_dotenv

load_dotenv()

app_secret = os.environ["APP_SECRET"]  # raises KeyError if missing
```

Keep `.env*` in `.gitignore`. Never hardcode keys, tokens, or credentials in source.

## Security scanning

- Use **bandit** for static security analysis:

  ```bash
  bandit -r src/
  ```

## See also

- `docs/rules/python/fastapi.md` (auth/JWT/CORS) for web-boundary rules; route auth/secrets edits through `mas-sec-reviewer` (§5).
