# Supra Token Factory

Standalone dApp for the `TokenFactory` / `CustomERC20` contracts described in
`frontend-integration-guide.docx`. Built per
`/home/webclues/.claude/plans/distributed-finding-meadow.md`.

## Setup

```bash
pnpm install
cp .env.example .env   # fill in Supra EVM QA chain id + RPC url if needed
pnpm dev
```

Sepolia works out of the box against a public RPC. Supra EVM QA won't appear
in the network switcher until `VITE_SUPRA_EVM_QA_CHAIN_ID` and
`VITE_SUPRA_EVM_QA_RPC_URL` are set — the integration guide never states
either value.

## Known gaps carried over from the source doc

1. **Sepolia TokenFactory address conflict.** The doc's deployment table says
   `0x0dD8fF327dFa222470837f55cbaB50FC63c323EA`; a JSON block and the ethers
   code sample later in the same doc say `0x4cf75cBC373e7B9591a2b0843AeA6C221Ea87Be6`.
   This app defaults to the table value — override with
   `VITE_SEPOLIA_FACTORY_ADDRESS` once confirmed. See `src/config/contracts.ts`.
2. **No ABI JSON was reachable.** `src/config/abis/*.abi.ts` were
   reconstructed from the function/event signatures listed in the doc, not
   from a real `TokenFactory.abi.json` / `CustomERC20.abi.json`. Worth a diff
   against the real ABI once available, particularly the unmarked
   (non-`indexed`) event args in `tokenFactory.abi.ts`.
3. **Supra EVM QA chain id / RPC URL** — not in the doc at all, required via
   env vars (see above).

## Structure

- `src/config/` — chains, per-chain contract addresses, ABIs
- `src/lib/reads/` `src/lib/tx/` — one function per contract call
- `src/lib/errors.ts` — maps the doc's revert-string and custom-error tables to UI copy
- `src/hooks/` — `useMintBudget` (faucet/mint budget + countdown), `useTokenList` (`allTokens()` + live `TokenCreated`), `useRole`
- `src/pages/` — the 5 screens from the doc's own "Suggested screens" section
