# Supra ER20C Token Factory

Standalone dApp for the `RateLimitedMintERC20Factory` / `RateLimitedMintERC20`
contracts on Supra EVM QA. The factory address is set with `VITE_SUPRA_EVM_QA_FACTORY` (see Setup).

- **Anyone** can create a token through the factory and becomes its owner.
- **Anyone** can mint any factory token. Non-owners are limited per request
  (`mintCapPerRequest`) and per rolling window (`mintCapPerPeriod` over
  `mintPeriod` seconds); the limit counts against the caller, not the recipient.
- The **owner** mints without rate limits (never past `maxSupply`, if set) and
  can change the limits, transfer ownership, or renounce it.

## Setup

```bash
pnpm install
cp .env.example .env   # set VITE_SUPRA_EVM_QA_CHAIN_ID + VITE_SUPRA_EVM_QA_FACTORY + VITE_SUPRA_EVM_QA_RPC_URL (see RPC proxy)
pnpm dev
```

Without the chain id and factory address the app shows a "Network not configured" screen; without
`VITE_SUPRA_EVM_QA_RPC_URL`, `pnpm dev` / `pnpm build` stop with an error.

### RPC proxy

The browser never calls the RPC node directly. The QA node is plain `http://`
(blocked from an `https://` page as mixed content) and `rpc-proxy.supra.com`
sends no CORS headers, so either one fails from a browser. Instead the app calls
`/api/rpc` on its own origin, which forwards to `VITE_SUPRA_EVM_QA_RPC_URL`:

- `pnpm dev` / `pnpm preview`: the proxy in `vite.config.ts`
- Vercel: the `api/rpc.ts` function

Set `VITE_SUPRA_EVM_QA_RPC_URL` to the node's real URL (e.g.
`https://rpc-proxy.supra.com/rpc/v1/eth/wallet_integration`) in `.env` and in the
Vercel project settings. `/api/rpc` is resolved against the current site, so it
also works on preview URLs.

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
3. **Supra EVM QA chain id / RPC node** aren't in the doc — env vars required.

## Structure

- `src/config/` — chain, factory address, ABIs
- `src/lib/reads/` `src/lib/tx/` — one function per contract call; all writes go
  through `lib/tx/write.ts`, which refuses to send if the wallet is on another chain
- `src/lib/mintStatus.ts` — combines owner / supply / caps / `mintWindowOf` into
  "how much can this wallet mint right now"
- `src/hooks/` — `useTokenList`, `useMintStatus`, `useTokenOwners`, `useCreatedTokens`, `useTokenParam` (keeps the selected token in `?token=`)
- `src/pages/` — Mint, Wallet, CreateToken, Manage
