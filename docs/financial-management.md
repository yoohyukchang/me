# Financial Management

`/financial-management` is a password-gated personal page. Chase, Bank of
America, and Fidelity are linked via Plaid; an AWS Lambda on a weekly
schedule pulls fresh data and writes it to DynamoDB. The page itself never
calls Plaid directly and has no manual "sync" button. Two things stay
intentionally manual, by design: categorizing holdings (a judgment call
Plaid can't make), and tracking contributions and any holding outside the
connected providers — a Korean brokerage account, for instance, or any
future account that isn't Plaid-reachable.

## Layers

```
src/lib/financial-management/
  types.ts              domain types shared by every layer, plus toUsd()
                         and classifyAccountKind()
  holdings-view.ts       toUnifiedHoldings() — merges Plaid's holdings with
                         manually-entered ones into one provider-agnostic list
  portfolio-history.ts   computeHistoryRows() — combines weekly Portfolio
                         Value snapshots with the contribution ledger
  providers/types.ts     HoldingsProvider / VestingProvider / BalanceProvider
                         — the only contracts the Integrator depends on
  providers/plaid/       Plaid's implementation of those contracts
  integrator/sync.ts     syncItem() / runFullSync() — the only thing that
                         orchestrates providers and writes the stored snapshots
  integrator/vesting.ts  pure ledger-reconciliation for vested share tracking
  store/                 one file per DynamoDB table, no business logic

infra/lambda/sync-handler.ts             imports integrator/sync.ts directly
infra/lib/financial-management-stack.ts  tables, Lambda, EventBridge Scheduler
```

The Lambda and the Next.js API routes both call into `integrator/sync.ts` —
the Lambda on the weekly schedule, the API routes once inline right after a
new Plaid Item is linked or a manual holding changes (so the page reflects
reality immediately, not next Saturday). Nothing outside `providers/plaid/`
talks to the `plaid` SDK.

**Adding a data source later** (a Korean brokerage, another bank):
implement `HoldingsProvider`/`BalanceProvider` in a new `providers/<name>/`
folder and add a case in `integrator/sync.ts`. Everything above that layer
— store, API routes, frontend — only ever sees the normalized `Account` /
`Holding` / `Security` shapes in `types.ts`, or the fully-merged
`UnifiedHolding` that `holdings-view.ts` produces.

## Data model

| Table | Key | Purpose |
|---|---|---|
| `FinancialPlaidItems` | `itemId` | One row per linked institution: access token (KMS-encrypted), status, current balance (depository items), vested-share tracking (the Fidelity item). |
| `FinancialHoldingsViews` | `id` | Named groupings of holdings ("By Category", or whatever you add). |
| `FinancialHoldingsViewCategories` | `viewId`, `id` | Categories, scoped per view. |
| `FinancialHoldingsAssignments` | `viewId`, `holdingKey` | Which category a holding sits in, per view. No row = Uncategorized, computed at read time. |
| `FinancialHoldingsCurrent` | fixed `"current"` | Latest Fidelity accounts/holdings/securities blob, overwritten weekly. |
| `FinancialManualHoldings` | `id` | Holdings maintained by hand — any account Plaid can't reach, in whichever currency it's actually held in. |
| `FinancialContributions` | `id` | The contribution ledger — money moved into the portfolio from outside it, by hand, with the exchange rate locked at entry time. |
| `FinancialPortfolioHistory` | `date` | Immutable weekly snapshot of Portfolio Value only (Plaid holdings + manual holdings, combined). Net contribution is derived, not stored — see below. |
| `FinancialNetWorth` | `date` | Immutable weekly snapshot: per-institution depository balances, Fidelity value, total, USD→KRW rate at that time. |

## Portfolio Value

Portfolio Value is automatic, combining two sources: Fidelity's holdings
(brokerage, 401k, RSU stock plan — all on one Plaid Item, since they share
one fidelity.com login, so one `/investments/holdings/get` call covers all
of them) plus whatever's in `FinancialManualHoldings`, converted to USD at
the current rate.

### Cash Plaid doesn't itemize

Confirmed against a real account: Plaid can report an investment account's
`balances.current` as fully correct while simply not returning a holdings
line item for its core/sweep cash position (SPAXX, in Fidelity's case) —
even though that account's own investment-transactions feed shows that
cash's activity (purchases into and redemptions from the core account).
Summing only the itemized `holdings` would silently undercount the account
by exactly that cash balance.

`reconcileCashHoldings` (`providers/plaid/cash-reconciliation.ts`, kept
free of any Plaid import so it's testable in isolation) closes this per
account: it compares the account's reported balance against the sum of
its itemized holdings, and if there's a positive gap, adds an ordinary
holding — "Cash & money market", priced at $1/unit like the money market
fund it represents — for the difference. Everything downstream (Portfolio
Value, Net Worth, the pie chart, categorization) just sees it as another
holding; no special-casing needed past this one reconciliation step. The
vested-shares adjustment explicitly skips any holding flagged
`isCashEquivalent`, since cash was never unvested restricted stock to
begin with.

**Vested vs. unvested RSU value.** Plaid/Fidelity reports no vested/unvested
split for a stock-plan account — `vested_quantity`/`vested_value` both come
back `null`. A holding's plain `quantity` is the *full grant*, vested and
unvested combined. Counting the full grant would put stock that isn't
actually owned yet (and could be forfeited) into Portfolio Value and Net
Worth. Instead, `PlaidItem.vestedSharesByAccount` tracks cumulative vested
*quantity* per stock-plan account, built by watching
`/investments/transactions/get` for Plaid transaction type `transfer`
(Plaid's own definition: "a position changing with no buy/sell activity" —
exactly what a vest is) on an account `classifyAccountKind` (`types.ts`)
identifies as a stock plan. `reconcileVestedShares`
(`integrator/vesting.ts`) folds new vest transactions into a per-transaction
ledger, idempotent against re-processing. In `integrator/sync.ts`, a
stock-plan holding's value gets replaced with `min(vestedSharesByAccount[
accountId], quantity) × price` before being stored — the quantity and price
shown stay Plaid's real numbers; only the counted value changes.

`classifyAccountKind` matches by account **name** first (`RSU`, `ESPP`,
`STOCK PLAN`), falling back to `subtype === "stock plan"` — Plaid can
report a stock-plan account's `subtype` as plain `"brokerage"` for a
newly-linked Item before its backend extraction settles, so the name match
is the reliable signal.

## Contributions

Net Contribution — money moved into the portfolio from outside it, as
opposed to market growth — is tracked by hand in `FinancialContributions`,
not inferred from transaction data. Each entry has a date, an amount, a
currency, and the exchange rate locked in at entry time (1 for USD). This
covers every funding path uniformly: a bank transfer to Fidelity, a 401k
contribution, an RSU grant you choose to count the moment it vests, a
deposit into a Korean brokerage account — all the same kind of entry,
regardless of currency or which account received it.

Net Contribution *as of a given date* — the figure Portfolio History shows
— is the running total of every contribution entry dated on or before it,
computed by `computeHistoryRows` (`portfolio-history.ts`) at read time
rather than stored on the weekly snapshot. That's deliberate: editing or
backdating a contribution instantly corrects every affected week's Total
Profit and Return, instead of requiring historical snapshots to be
rewritten. `FinancialPortfolioHistory` only ever stores the one thing that
genuinely can't be reconstructed after the fact — what Portfolio Value
actually was on a given date.

## Manual holdings

`FinancialManualHoldings` holds anything Plaid can't reach — ticker, name,
an account label you choose (e.g. "Kiwoom Securities"), shares, price, and
currency. `holdings-view.ts`'s `toUnifiedHoldings` merges these with
Plaid's holdings into one `UnifiedHolding[]` list: each row keeps its
native currency for display, plus a `valueUsd` computed at the live
USD/KRW rate for aggregation (Portfolio Value, the pie chart, Net
Contribution comparisons). Categorization (Views/Categories/Assignments)
works identically regardless of source — a manual holding's `id` is just
another `holdingKey`.

Unlike Plaid holdings, manual ones have no weekly sync to wait for:
creating, editing, or deleting one triggers `runFullSync()` inline so
Portfolio Value reflects it immediately. Net Worth does not include manual
holdings — it stays Chase + BOA + Fidelity only.

## Views

A "view" is an independent grouping of the same underlying holdings — its
own ordered categories (drag to reorder), its own holding→category
assignments (set per holding from its row's Category dropdown, including
back to "Uncategorized", which deletes the assignment row rather than
storing a sentinel). The default view is "By Category"; add more from the
Portfolio Holdings tab's "+ New view" control. A new holding, or any
holding you set back to "Uncategorized", shows under "Uncategorized" in
every view — that bucket is computed at read time, never stored. Within
each category (and within Uncategorized), holdings are always ordered by
USD value, highest first — there's no manual holding order to maintain.

## Schedule & failure handling

EventBridge Scheduler (not a plain cron Rule — it has a native retry
policy) invokes `financial-management-sync` every Saturday 13:00 UTC,
safely after Friday's close and settlement. Failed invocations retry up to
10 times over the next 24 hours; if every retry is exhausted, the event
lands in the `FinancialManagementSyncDLQ` SQS queue instead of vanishing
silently. A single broken Plaid Item (`ITEM_LOGIN_REQUIRED`) doesn't block
the rest of the run — it's marked `login_required` and the Portfolio
Holdings tab's Accounts panel shows a "Reconnect" action for just that
institution; a healthy connection also offers "Add account" (Link update
mode) for granting access to an account you didn't originally share, and
"Disconnect" to cleanly remove a connection (calls `/item/remove`, not just
a local delete).

**A brand-new Fidelity Item's holdings can lag its own transactions feed.**
Plaid's holdings-snapshot extraction is a separate, slower pipeline than
investment-transactions extraction. `plaid/webhook/route.ts` resyncs the
specific Item on `HOLDINGS`/`INVESTMENTS_TRANSACTIONS` `DEFAULT_UPDATE` or
`HISTORICAL_UPDATE` webhooks (`classifyItemWebhook`'s `data_ready`
outcome), so this closes itself out within minutes of linking instead of
sitting empty until the next Saturday.

## Secrets

Plaid `client_id`/`secret` are plain env vars on both Vercel and the Lambda
(mirroring how the DynamoDB IAM credentials were already handled in this
app) — Investments/Balance are read-only products, so this matches the
existing risk posture. Plaid access tokens, the one genuinely sensitive
secret this app stores, live only in `FinancialPlaidItems`, which has its
own customer-managed KMS key — a tier above the default encryption the
other tables use.
