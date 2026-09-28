# Supra ERC Token Factory

Standalone dApp for the `RateLimitedMintERC20Factory` / `RateLimitedMintERC20`
contracts on Supra EVM QA (factory `0x2fc3aDFf0F18E2feF3EC9902E0908b09b1a4d332`).

- **Anyone** can create a token through the factory and becomes its owner.
- **Anyone** can mint any factory token. Non-owners are limited per request
  (`mintCapPerRequest`) and per rolling window (`mintCapPerPeriod` over
  `mintPeriod` seconds); the limit counts against the caller, not the recipient.
- The **owner** mints without rate limits (never past `maxSupply`, if set) and
  can change the limits, transfer ownership, or renounce it.

## Setup

```bash
pnpm install
cp .env.example .env   # set VITE_SUPRA_EVM_QA_CHAIN_ID + VITE_SUPRA_EVM_QA_RPC_URL
pnpm dev
```

Without the chain id and RPC URL the app shows a "Network not configured" screen.

## Pages

| Route | Who | What |
|---|---|---|
| `/` Mint | anyone | Mint to yourself or another address; shows caps, your window usage and reset countdown, supply |
| `/wallet` | connected | Balances, transfer / approve, filter to tokens you created |
| `/create` | anyone | All `createToken` params: name, symbol, decimals, max supply, period, caps |
| `/manage` | token owner | `setMintLimits`, `transferOwnership`, `renounceOwnership` |

Mint and Manage accept `?token=0x…` to preselect a token.

## Known gaps

1. **ABIs are written from the contract reference doc**, not a compiled ABI
   JSON (`src/config/abis/*.abi.ts`). Worth diffing against the real ABI.
2. **No events or custom revert errors are documented**, so new tokens are
   found by polling `allTokensLength()` every 15s, and the token's own
   rate-limit / supply-cap reverts show viem's raw message. The Mint and
   Create forms pre-check those limits client-side.
3. **Supra EVM QA chain id / RPC URL** aren't in the doc — env vars required.

## Structure

- `src/config/` — chain, factory address, ABIs
- `src/lib/reads/` `src/lib/tx/` — one function per contract call; all writes go
  through `lib/tx/write.ts`, which refuses to send if the wallet is on another chain
- `src/lib/mintStatus.ts` — combines owner / supply / caps / `mintWindowOf` into
  "how much can this wallet mint right now"
- `src/hooks/` — `useTokenList`, `useMintStatus`, `useTokenOwners`, `useCreatedTokens`, `useTokenParam` (keeps the selected token in `?token=`)
- `src/pages/` — Mint, Wallet, CreateToken, Manage
