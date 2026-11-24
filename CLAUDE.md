# CLAUDE.md

Personal website (Next.js 15 on Vercel) plus a password-gated personal
finance dashboard at `/financial-management` (Plaid → DynamoDB, scheduled
AWS Lambda). The user writes to you in Korean; reply in Korean, keep code,
comments, docs, and commit messages in English.

## Start of every session

1. Read `README.md` (layout, commands, env vars).
2. For anything touching `/financial-management`, `src/lib/financial-management/`,
   `src/app/api/financial-management/`, or `infra/`, read
   `docs/financial-management.md` in full. Its "Current data state" and
   "Open items" sections record what's true about the real accounts and
   what's unresolved — start from there, not from assumptions.
3. Before changing how Plaid is called or how a Plaid field is interpreted,
   check Plaid's online docs (links at the bottom of the design doc).
   Field semantics differ by account type, e.g. for investment accounts
   `balances.current` is the total account value and `balances.available`
   is withdrawable cash.
4. When a question is "does the stored number match reality", verify
   against live data (design doc → "Calling Plaid directly") rather than
   reasoning from code alone.

## Verifying changes

- `npx tsc --noEmit -p .` and `node --test tests/*.test.cjs` from the repo root.
- Infra: `cdk synth` per README. The two `fx.ts` errors from
  `cd infra && npx tsc` are pre-existing and expected.
- Code under `src/lib/financial-management/{integrator,providers,store}` and
  `expenses.ts` runs
  in **both** Vercel and the Lambda; a change there needs both deploys.

## Rules

- Never add a `Co-Authored-By` trailer to commits in this repo.
- Ask before deploying (push to `main` or `cdk deploy`) and before writing
  to production DynamoDB. When writing, back up the affected table first
  (`aws dynamodb scan ... > <scratchpad>/backup.json`) and never delete
  History/Net Worth rows unless explicitly asked.
- Don't run the Lambda in `{"mode":"weekly"}` except on a Saturday or when
  asked — it writes today's History/Net Worth rows. `{"mode":"daily"}` is safe.
- `/accounts/balance/get` is billed per call; don't add it to anything that
  runs more than weekly without saying so.
- Never print secrets: `.env.local` values, Plaid `access_token`s (strip
  `accessToken` from `FinancialPlaidItems` output), session secret.
- Always pass `--profile portfolio-dev --region us-west-2` to `aws`
  explicitly; zsh won't word-split a `$P` variable holding them.

## Gotchas already learned

- Plaid: one Item per bank, all accounts selected. A second link with a
  different selection silently drops accounts from the first. Healthy status
  and no errors don't prove data is flowing. See design doc → "One Item per
  bank".
- Expenses before 2026-11-01 are closed to the sync. After touching that code
  or data, check that August–October totals still match the design doc.
- Expense months are string math on `YYYY-MM-DD`; never `new Date(date)`.
- Nothing is auto-excluded from expense review, by the owner's choice.

- `/investments/holdings/get` is Plaid's cached extraction; its prices can
  lag Fidelity by a trading day (~$4.4k once). Weekly snapshots use live
  `/accounts/balance/get` for that reason.
- Plaid doesn't itemize Fidelity's SPAXX core cash; it's reconstructed as
  `balances.current − itemized holdings`.
- The installed `plaid` SDK (v51) uses `new PlaidClient(...)` with
  namespaced methods (`plaidClient.investments.getHoldings`), not the
  `PlaidApi`/`Configuration` style shown in most online examples. For
  ad-hoc scripts, call the REST endpoints with `fetch`/`curl`.
- Fidelity deposits/withdrawals and 401(k) contributions are imported into
  `FinancialContributions` automatically (`plaid-<accountId>-<date>` ids,
  read-only). Only non-Plaid money should ever be entered by hand.
- The S&P 500 line uses Yahoo's unofficial chart API for `^SP500TR`. If it
  breaks, the Saturday run fails *after* writing snapshots; stored closes
  remain. Check `FinancialBenchmarkPrices`' latest date first.
- The RSU account's subtype is `stock plan` in holdings but `brokerage` in
  balance responses. `classifyAccountKind` matches on the account name first
  for that reason.
