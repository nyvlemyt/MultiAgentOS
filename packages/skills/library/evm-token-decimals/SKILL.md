---
name: evm-token-decimals
description: "Use when reading ERC-20 balances, pricing on-chain amounts, comparing token amounts across EVM chains, or handling bridged assets — to prevent silent decimal-mismatch bugs (balances/USD off by orders of magnitude with no error). Do NOT use for non-EVM chains, for generic float-precision questions unrelated to token decimals, or as a substitute for an audited pricing oracle."
summary: "Defeats the most common EVM money bug: assuming token decimals are constant (USDC is 6 on Ethereum, 6 or 18 elsewhere; bridged wrappers drift). Rule: never hardcode 10**n; query decimals() at runtime, cache by (chain_id, token_address) NOT by symbol, use exact math (Decimal/BigInt, never float), default to 18 with a visible WARN log when decimals() reverts, and re-query after bridging/wrapping. Ships safe normalization snippets for web3.py, ethers.js, and Solidity (normalize to 18-decimal WAD). MAS variant: a deterministic correctness pattern for any crypto-project registered by path; no MAS LLM call needed, no funds moved — it is read-side correctness, so it never trips a §5 risky-action gate by itself."
metadata: {origin: affaan-m/ecc, license: MIT, cluster: skill:core-token, tier: T2, status: library}
---

<!-- pattern from affaan-m/ecc skills/evm-token-decimals/SKILL.md -->

# EVM Token Decimals

## Overview

A token amount on an EVM chain is a raw integer; its human value is `raw / 10**decimals`. The bug class this skill kills is treating `decimals` as a constant. USDC is 6 decimals on Ethereum mainnet but its representation can differ on other chains, and bridged or wrapped versions of an asset frequently carry a different precision than the canonical token. Hardcoding `1_000_000` because "USDC is 6 decimals" produces balances and USD figures that are silently wrong by orders of magnitude — no exception is thrown, the number is just incorrect. This skill provides the runtime-lookup-plus-cache discipline and safe normalization snippets that make that bug impossible.

It is a deterministic coding pattern, not a service. Nothing here calls an LLM or moves funds; it is read-side correctness applied to whichever crypto project is registered by path in MultiAgentOS.

## When to Use / When NOT

Use when:
- Reading ERC-20 `balanceOf` in Python, TypeScript, or Solidity
- Converting on-chain balances to fiat / computing portfolio value
- Comparing token amounts across two or more EVM chains
- Handling bridged or wrapped assets, or building bots, dashboards, aggregators

Do NOT use when:
- The chain is not EVM-compatible (decimals semantics differ)
- The question is generic float precision unrelated to token decimals
- A real, audited pricing oracle is required — this skill normalizes units, it does not price assets

## Principles

*Source: ECC `skills/evm-token-decimals` + CLAUDE.md §5 (read-side correctness never auto-trips a risky-action gate; any on-chain write or fund movement still gates).*

1. **Decimals are data, not a constant.** Always query `decimals()` at runtime. Any `10 ** 6` literal in balance math is a latent bug.
2. **Cache by identity, never by symbol.** The cache key is `(chain_id, token_address)`. Two chains can share a symbol with different decimals; a symbol is not an identity.
3. **Exact math only.** Use `Decimal`, `BigInt`, or fixed-point integer math. Float introduces rounding error that compounds in pricing.
4. **Fail loud, fall back safe.** If `decimals()` reverts (old/non-standard token), default to 18 AND emit a visible WARN log. A silent default hides the next bug.
5. **Re-query after a precision-changing event.** Bridging, wrapping, or a proxy upgrade can change decimals; a stale cache entry is wrong data.
6. **Normalize before you compare.** Internal accounting picks one scale (18-decimal WAD is conventional) and converts every amount to it before any comparison or pricing.

## Process

1. **Identify the token + chain.** Resolve the checksummed `token_address` and the `chain_id` for every amount in play.
2. **Look up decimals (cached).** `get_decimals(chain_id, token_address)` — call `decimals()` once per identity, memoize the result keyed on `(chain_id, token_address)`.
3. **Guard the lookup.** Wrap the call: on revert, log `WARN decimals() reverted on <addr> (chain <id>), defaulting to 18` and use 18.
4. **Convert with exact math.** `value = Decimal(raw) / Decimal(10 ** decimals)` (Python) / `formatUnits(raw, decimals)` (ethers) / `normalizeToWad(token, amount)` (Solidity).
5. **Normalize to a single internal scale** before comparing amounts across tokens/chains or feeding a pricing step.
6. **Invalidate on bridge/wrap/upgrade.** Drop the cache entry for any token whose representation may have changed, then re-query.

### Reference snippets

web3.py — query + cache:
```python
from functools import lru_cache
from decimal import Decimal
from web3 import Web3

ERC20_ABI = [
    {"name": "decimals", "type": "function", "inputs": [],
     "outputs": [{"type": "uint8"}], "stateMutability": "view"},
    {"name": "balanceOf", "type": "function",
     "inputs": [{"name": "account", "type": "address"}],
     "outputs": [{"type": "uint256"}], "stateMutability": "view"},
]

@lru_cache(maxsize=512)
def get_decimals(chain_id: int, token_address: str) -> int:
    w3 = get_web3_for_chain(chain_id)
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(token_address), abi=ERC20_ABI)
    return contract.functions.decimals().call()
```

Defensive fallback:
```python
try:
    decimals = contract.functions.decimals().call()
except Exception:
    logging.warning("decimals() reverted on %s (chain %s), defaulting to 18",
                    token_address, chain_id)
    decimals = 18
```

Solidity — normalize to 18-decimal WAD:
```solidity
interface IERC20Metadata { function decimals() external view returns (uint8); }

function normalizeToWad(address token, uint256 amount) internal view returns (uint256) {
    uint8 d = IERC20Metadata(token).decimals();
    if (d == 18) return amount;
    if (d < 18) return amount * 10 ** (18 - d);
    return amount / 10 ** (d - 18);
}
```

ethers.js:
```typescript
import { Contract, formatUnits } from 'ethers';
const ERC20_ABI = [
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
];
async function getBalance(provider: any, token: string, wallet: string) {
  const c = new Contract(token, ERC20_ABI, provider);
  const [decimals, raw] = await Promise.all([c.decimals(), c.balanceOf(wallet)]);
  return formatUnits(raw, decimals);
}
```

Quick on-chain probe: `cast call <token> "decimals()(uint8)" --rpc-url <rpc>`.

## Rationalizations

| Excuse | Reality |
|---|---|
| "USDC is always 6 decimals" | Not across chains, and not for bridged/wrapped variants. Query it. |
| "I'll cache by symbol, it's simpler" | Two chains share a symbol with different decimals — symbol is not identity. Key on `(chain_id, address)`. |
| "Float is fine for a dashboard" | Float rounding compounds; a display bug becomes a pricing bug. Use Decimal/BigInt. |
| "decimals() never reverts" | Old and non-standard tokens exist. Default to 18 AND log it. |
| "The cache never goes stale" | Bridging/wrapping/proxy upgrades change decimals. Invalidate on those events. |

## Red Flags

- A literal `10 ** 6`, `1_000_000`, or `1e18` sitting in balance/price math
- A decimals cache keyed on token symbol or token name
- `float()` / JS `Number` used for raw on-chain amounts
- A bare `decimals()` call with no try/except and no fallback log
- Cross-chain amount comparison without a prior normalize-to-common-scale step

## Verification Criteria

- [ ] Every balance/price path calls `decimals()` at runtime (no hardcoded power-of-ten in money math)
- [ ] The decimals cache key is `(chain_id, token_address)`, never a symbol
- [ ] All raw-amount arithmetic uses exact math (`Decimal`/`BigInt`/fixed-point), never float
- [ ] `decimals()` revert path defaults to 18 and emits a visible WARN log
- [ ] Cross-token / cross-chain comparisons normalize to one internal scale first
- [ ] Cache is invalidated after a bridge / wrap / proxy-upgrade event
