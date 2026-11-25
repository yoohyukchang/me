# Financial Management

`/financial-management` is a password-gated personal page. Chase, Bank of
America, and Fidelity are linked via Plaid; an AWS Lambda refreshes
holdings daily and records the weekly History/Net Worth snapshots every
Saturday, writing to DynamoDB. The page itself never
calls Plaid directly and has no manual "sync" button. Two things stay
intentionally manual, by design: categorizing holdings (a judgment call
Plaid can't make), and tracking contributions and any holding outside the
connected providers — a Korean brokerage account, for instance, or any
future account that isn't Plaid-reachable.

The Expenses tab is the exception on both counts: it syncs bank transactions
when opened, and each transaction is reviewed by hand. See [Expenses](#expenses).

## Layers

```
src/lib/financial-management/
  types.ts              domain types shared by every layer, plus toUsd()
                         and classifyAccountKind()
  holdings-view.ts       toUnifiedHoldings() — merges Plaid's holdings with
                         manually-entered ones into one provider-agnostic list
  portfolio-history.ts   computeHistoryRows() / benchmarkValueOn() — combines
                         weekly Portfolio Value snapshots with the contribution
                         ledger and the S&P 500 comparison
  time-filter.ts         applyTimeFilter() — Week/Month + range presets shared
                         by the History and Net Worth charts
  net-worth-buckets.ts   institution → purpose caption, fixed colors/order
  providers/types.ts     HoldingsProvider / InvestmentActivityProvider /
                         BalanceProvider / BenchmarkProvider — the only
                         contracts the Integrator depends on
  providers/plaid/       Plaid's implementation of those contracts
  providers/yahoo/       benchmark daily closes (S&P 500 Total Return)
  integrator/sync.ts     syncItem() / refreshInvestmentHoldings() /
                         runWeeklySnapshot() — the only thing that
                         orchestrates providers and writes the stored snapshots
  expenses.ts            expense types and pure rules: planExpenseSync(),
                         findMissingAccounts(), summarizeMonth()
  integrator/expense-sync.ts  syncItemExpenses() / syncAllExpenses()
  integrator/vesting.ts  pure ledger-reconciliation for vested share tracking
  store/                 one file per DynamoDB table, no business logic

infra/lambda/sync-handler.ts             imports integrator/sync.ts directly
infra/lib/financial-management-stack.ts  tables, Lambda, EventBridge Scheduler
```

The Lambda and the Next.js API routes both call into `integrator/sync.ts` —
the Lambda on its daily/weekly schedules, the API routes once inline right
after a Plaid Item is linked or reconnected (`syncAllItems()`, so the page
reflects it immediately). Only the Saturday run (`runWeeklySnapshot()`)
ever writes Portfolio History or Net Worth, so both stay strictly weekly. Nothing outside `providers/plaid/`
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
| `FinancialPlaidItems` | `itemId` | One row per linked institution: access token (KMS-encrypted), status, current balance (depository items), vested-share tracking (the Fidelity item), expense cursor and known/missing accounts (bank items). |
| `FinancialHoldingsViews` | `id` | Named groupings of holdings ("By Category", or whatever you add). |
| `FinancialHoldingsViewCategories` | `viewId`, `id` | Categories, scoped per view. |
| `FinancialHoldingsAssignments` | `viewId`, `holdingKey` | Which category a holding sits in, per view. No row = Uncategorized, computed at read time. |
| `FinancialHoldingsCurrent` | fixed `"current"` | Latest Fidelity accounts/holdings/securities blob, overwritten daily. |
| `FinancialExpenseTransactions` | `transactionId` | The expense ledger: Plaid transaction id, or `manual_<uuid>` for cash. PITR + deletion protection. |
| `FinancialExpenseCategories` | `categoryId` | Expense categories, unrelated to holdings categories. Can't be deleted while in use. PITR + deletion protection. |
| `FinancialManualHoldings` | `id` | Holdings maintained by hand — any account Plaid can't reach, in whichever currency it's actually held in. |
| `FinancialContributions` | `id` | The contribution ledger — money moved into the portfolio from outside it. Plaid-imported rows (`source: "plaid"`, id `plaid-<accountId>-<date>`, read-only) plus manual rows (UUID id, exchange rate locked at entry time). |
| `FinancialBenchmarkPrices` | `symbol`, `date` | Daily closes of the benchmark index (`^SP500TR`), appended by the Saturday run. |
| `FinancialPortfolioHistory` | `date` | Weekly (Saturday) snapshot of Portfolio Value only (live Fidelity balances + manual holdings). Net contribution is derived, not stored — see below. Plain `Put`: a re-run on the same date overwrites that row. |
| `FinancialNetWorth` | `date` | Weekly (Saturday) snapshot: per-institution depository balances, live Fidelity value, total, USD→KRW rate at that time. Same overwrite-on-rerun semantics. |

## Portfolio Value

Portfolio Value is automatic, combining two sources: Fidelity (brokerage,
401k, RSU stock plan — all on one Plaid Item, since they share one
fidelity.com login) plus whatever's in `FinancialManualHoldings`,
converted to USD at the current rate.

Two different Plaid endpoints feed it, on purpose:

| Where | Endpoint | Freshness |
|---|---|---|
| Portfolio Holdings tab (per-security rows, pie chart) | `/investments/holdings/get` | Quantities and cash as of Plaid's last update; prices at the latest market close when there is one (below). Not billed per call. |
| Portfolio History / Net Worth (Saturday) | `/accounts/balance/get` → `balances.current` per account | Fidelity's latest published close, fetched at call time. Billed per call, so only the weekly run uses it. |

So the Holdings tab total and the latest History value can differ slightly;
History is the one that matches Fidelity's own "Total account value".

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

### Prices on the Holdings tab

`/investments/holdings/get` returns two prices. `institution_price` is the
institution's and runs a close behind, while its `institution_price_as_of`
says the update date (on 2026-11-24 it held 11-23 closes labelled 11-24).
`close_price` on the security, with `close_price_as_of`, matched the public
11-24 close for all ten brokerage positions that evening. So
`toUnifiedHoldings` prices a row at `close_price`, scaling the institution's
value to keep a stock plan's vested share.

- It falls back to the institution's price when there is no close (401(k)
  funds, RSU), when the close is more than 4 days older than the institution's
  date, or when the two differ by more than 2× (a split that reached only one).
- Applied at read time only. The stored snapshot keeps the institution's
  values, which cash reconciliation, History, and Net Worth use, so the tab's
  total intentionally differs from the Fidelity balance until the next update.
- The tab shows the close date and `positionsUpdatedAt` (`/item/get`'s last
  successful update, not our sync time). Trades appear only after that.
- Closes are only as fresh as the last sync, hence the weekday 9pm Pacific run.
  They were in Plaid by 8:40pm on 2026-11-24; the exact time, and whether a
  webhook follows, hasn't been measured.

## Contributions

Net Contribution — money moved into the portfolio from outside it, as
opposed to market growth — lives in `FinancialContributions`. Each entry
has a date, an amount, a currency, and the exchange rate locked in at entry
time (1 for USD). Two sources feed it:

- **Imported from Plaid, automatically.** Every `syncItem` run on the
  Fidelity Item reads `/investments/transactions/get` once
  (`providers/plaid/investment-activity.ts`) and, besides vests, sums
  `cash` transactions of subtype `deposit`/`withdrawal`/`contribution` per
  account per day on every non-stock-plan account (brokerage EFTs, 401(k)
  payroll contributions incl. match). Each account-day is upserted under the
  deterministic id `plaid-<accountId>-<date>`, so re-reading the trailing
  14-day window (Plaid posts late) overwrites instead of duplicating. Days
  netting to zero (Fidelity's account-verification micro-deposits) are
  dropped. These rows are read-only: the UI shows "Auto · Plaid" and the
  PATCH/DELETE route rejects `plaid-` ids.
- **By hand**, for anything Plaid can't see — a Korean brokerage deposit,
  for instance. Don't hand-enter a Fidelity deposit; it'd be counted twice.

To re-import history from scratch (e.g. after changing the import rule):
set the Fidelity item's `investmentTransactionsSince` to null and run the
Lambda; the next sync reads 24 months.

Net Contribution *as of a given date* — the figure Portfolio History shows
— is the running total of every contribution entry dated on or before it,
computed by `computeHistoryRows` (`portfolio-history.ts`) at read time
rather than stored on the weekly snapshot. That's deliberate: editing or
backdating a contribution instantly corrects every affected week's Total
Profit and Return, instead of requiring historical snapshots to be
rewritten. `FinancialPortfolioHistory` only ever stores the one thing that
genuinely can't be reconstructed after the fact — what Portfolio Value
actually was on a given date.

## S&P 500 comparison (Portfolio History chart)

The Portfolio History tab charts Portfolio Value against a counterfactual:
*the same contributions, invested in the S&P 500 instead*.
`benchmarkValueOn(date, contributions, prices)` buys index units with every
contribution dated on or before `date` at that contribution's close (the
last close on or before it — a weekend deposit can't trade earlier),
sells units for a negative contribution, and values the units at `date`'s
close. It's derived at read time like Net Contribution, so editing or
backdating a contribution re-prices the whole line.

The index is the S&P 500 **Total Return** (`^SP500TR`, dividends
reinvested — like holding VOO with dividend reinvestment), since the
portfolio collects dividends too. The source is Yahoo Finance's public
chart endpoint (`providers/yahoo/benchmark.ts`): unofficial, but the only
free, keyless source of that index current through the latest close (FRED
has only the price index, a day late; Stooq blocks non-browser clients).
`refreshBenchmarkPrices()` runs last in the Saturday job, fetching from a
week before the latest stored close, or from two weeks before the earliest
contribution when nothing is stored yet. Closes already stored survive any
Yahoo outage.

Both charts (Portfolio History, Net Worth) share `TimeFilterControls`:
Week (every snapshot) or Month (last snapshot of each month), and a range
— 3M / 6M / YTD / 1Y / All / Custom from–to.

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

Manual holdings need no sync at all: the Portfolio Holdings tab merges
them with the Plaid snapshot at read time, so an edit shows immediately.
They enter Portfolio History at the next Saturday snapshot. Net Worth does not include manual
holdings — it stays Chase + BOA + Fidelity only.

## Net Worth tab

Each institution holds money for a different purpose — Bank of America for
living expenses, Chase for leisure & travel savings, Fidelity for
investing. Institutions are always the primary label; the purpose is a
secondary caption under the name. That mapping (and the fixed color/stack
order) lives in `net-worth-buckets.ts`; an institution not listed there (a
new bank, a second Chase connection) still shows, with no caption, after
the known ones. The tab shows, for the selected snapshot, a donut plus a
table of account, balance, and share; below it, a line chart of total Net
Worth over time (hover for the per-institution split). Clicking a point
selects that snapshot.

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
The pie chart on Portfolio Holdings only ever shows categorized holdings —
Uncategorized value gets neither its own slice nor any weight in the
figure at its center. It isn't hidden, though: it still shows as its own
muted line below the category legend, followed by a "Portfolio total" line
reconciling the two, so it's visible that categorized + uncategorized
sums to everything you own. Each view has its own pie, since each view has
its own categorization.

## Expenses

Card and checking spending, reviewed by hand: pick a category, then Confirm,
Defer, or Exclude. Replaced a standalone phone app in November 2026, whose
AWS resources and Plaid Items have been deleted.

### Flow

1. A sync runs per bank Item: on the `TRANSACTIONS/SYNC_UPDATES_AVAILABLE`
   webhook, when the Expenses tab opens (or its Sync button), and daily in
   the Lambda. All call `syncItemExpenses()` (`integrator/expense-sync.ts`).
2. It claims a 90s lock on the Item, fetches accounts and `/transactions/sync`
   changes (neither billed per call), and passes them with the stored ledger
   to the pure `planExpenseSync()` (`expenses.ts`), which returns the writes.
3. Writes are conditional on `updatedAt`, so a sync can't overwrite a review
   made meanwhile. The cursor is saved last; a failed run is replayed.

### Statuses

| Status | Meaning |
|---|---|
| `PENDING_REVIEW` | In the Review queue. Every import starts here, as does manual cash spending. |
| `DEFERRED` | Still in Review, after the rest. |
| `APPROVED` | Confirmed; the only status counted in totals. Needs a category. |
| `EXCLUDED` | Not spending. The row is kept so a later sync or re-link can't bring it back. Restorable from Transactions → Excluded. |

### Rules to keep

- **Before 2026-11-01 (`EXPENSES_SYNC_FROM`) is closed.** The 313 migrated
  rows are never added to, changed, or removed by a sync. The owner can still
  edit them by hand.
- **Nothing outgoing is filtered.** Card payments and transfers come into
  Review and the owner excludes them; auto-excluding was tried and removed
  at their request. Money in (refunds) is skipped; they adjust by hand.
- **Owner edits win.** `bankAmount`/`bankMerchant`/`bankDate` hold what the
  bank last reported; `originalAmount`/`merchantName`/`date` are editable
  (split bills, rent month). A sync replaces an edited amount only when the
  bank's own amount changes, and an edited merchant or date never.
- **A bank change to an approved amount or merchant** returns the row to
  Review with a `revision` (before → after). If the bank reverts it, the row
  goes back to `APPROVED`. A posted approved row the bank withdraws is
  flagged (`removedByBank`), not deleted.
- **Pending → posted** gives a new transaction id; the row is re-keyed and
  its review kept.
- **Months are string math** on `YYYY-MM-DD` (`monthOf`). `new Date(date)`
  parses as UTC and puts the 1st in the previous month in Pacific time, which
  the old app did (it showed October as $6,879.09; the real total is
  $7,234.92). `date` is the bank's authorized date, else its posted date.

### One Item per bank, every account selected

This is the incident that led to the move. On 2026-11-09 this site linked
Chase and BofA with checking only, while the old app held its own Items on
the same Plaid client. The old Items then silently lost their credit cards:
`active`, no error, syncs succeeding, no card transactions. Linking Chase
again on 11-23 left this site's Chase Item in `ITEM_LOGIN_REQUIRED`, visible
only on a live call. Plaid documents this for Chase (a second Item with a
different account selection can invalidate the first); BofA behaved the same.

- Don't link a bank twice, from here or any other app on this Plaid client.
  `plaid/exchange` returns 409 for a duplicate, but the bank's OAuth has
  already run by then, so the existing Item may need Reconnect.
- To change accounts use Accounts → **Manage accounts** (Link update mode)
  and select all of them. Anything left unselected stops being shared.
- "No sync errors" doesn't mean data is flowing. `knownAccounts` (every account
  ever shared) is compared with `/accounts/get`, and gaps are stored as
  `missingAccounts` and shown as a warning. A deliberately dropped account
  keeps warning until the Item is removed.
- If a bank is disconnected and re-linked, reviews carry over by account
  mask + bank date + bank amount (`findRelinked`).
- Net Worth sums depository accounts only (`plaidBalanceProvider.fetchBalance`).
  Card balances are debt and are deliberately left out.

## Schedule & failure handling

EventBridge Scheduler (not a plain cron Rule — it has a native retry
policy) invokes `financial-management-sync` with `{"mode":"daily"}` at 13:00
UTC Sunday–Friday and at 9pm `America/Los_Angeles` Monday–Friday (refresh the
holdings snapshot; the evening run picks up that day's closes), and with
`{"mode":"weekly"}` on Saturday at 3pm `America/Los_Angeles` (sync every Item,
then record Portfolio History and Net Worth). Rows are dated in UTC, so a
weekly retry after midnight UTC (4pm PST / 5pm PDT) would be dated Sunday.
Both modes end with an expense sync, even if the first part failed. Failed invocations retry up to
10 times over the next 24 hours; if every retry is exhausted, the event
lands in the `FinancialManagementSyncDLQ` SQS queue instead of vanishing
silently. A single broken Plaid Item (`ITEM_LOGIN_REQUIRED`) doesn't block
the rest of the run — it's marked `login_required` and the Portfolio
Holdings tab's Accounts panel shows a "Reconnect" action for just that
institution; a healthy connection also offers "Manage accounts" (banks) or
"Add account" (Fidelity), both Link update mode, for granting access to an
account you didn't originally share, and "Disconnect" to cleanly remove a connection (calls `/item/remove`, not just
a local delete).

**Holdings refresh when Plaid does.** Plaid updates Fidelity about once per
market day, at a varying time, and sends `HOLDINGS` and
`INVESTMENTS_TRANSACTIONS` `DEFAULT_UPDATE`/`HISTORICAL_UPDATE` webhooks
together within a second. `plaid/webhook/route.ts` resyncs the Fidelity Item
on each (`classifyItemWebhook`'s `data_ready`). This rewrites
`FinancialHoldingsCurrent` and, as in any sync, upserts imported contributions
and vests; it never writes History or Net Worth. The daily run is the
fallback, and a webhook whose sync failed isn't retried by Plaid, only by that
run. It also closes the gap when a new Item's holdings lag its transactions
feed. Before 2026-11-24 these webhooks were ignored once holdings existed: an
update at 08:36 PT wasn't shown until 05:00 the next day.

**The weekly snapshot uses live balances, not holdings prices.**
Fidelity's balance is the last close it has published, not intraday: Monday
2026-11-23's close was absent at 22:50 PT and present at 08:36 PT the next
morning. Position × close + cash reproduces account 0094 in the
2026-11-21 row to the cent ($86,708.73, Friday's close, trades included); the
401(k) part has no public quotes to check against. Whether a close is there by
5am PT is unknown, hence the 3pm run.

`/investments/holdings/get` returns Plaid's cached daily extraction, and
its prices can lag the institution by a day — confirmed against a real
account, where it overstated Fidelity by ~$4.4k versus Fidelity's own
total. So `runWeeklySnapshot()` values each investment account at
`/accounts/balance/get`'s `current` instead (billed per call, so only
once a week). A stock-plan account's live balance includes unvested
shares, so it's scaled by the counted/full value ratio the holdings sync
applied. The Portfolio Holdings tab is priced separately; see
[Prices on the Holdings tab](#prices-on-the-holdings-tab).

## Secrets

Plaid `client_id`/`secret` are plain env vars on both Vercel and the Lambda
(mirroring how the DynamoDB IAM credentials were already handled in this
app) — Investments/Balance are read-only products, so this matches the
existing risk posture. Plaid access tokens, the one genuinely sensitive
secret this app stores, live only in `FinancialPlaidItems`, which has its
own customer-managed KMS key — a tier above the default encryption the
other tables use.

## Operations runbook

Everything below assumes the repo root as the working directory.

**AWS:** account `149536467459`, region `us-west-2`, CLI profile
`portfolio-dev` (CDK already bootstrapped). Pass `--profile portfolio-dev
--region us-west-2` explicitly to every `aws` call — in zsh, don't stash
those flags in a variable like `$P`; zsh won't word-split it.

**Deploying.** Two independent deploys:
- App (Next.js on Vercel, project `me`): push to `main` on GitHub; Vercel's
  Git integration builds production automatically. Check with
  `vercel ls --prod` / `vercel inspect <url>`.
- Infra (tables, Lambda, schedules): `cd infra`, export the Plaid vars, then
  `AWS_PROFILE=portfolio-dev npx cdk deploy FinancialManagementStack`.
  The Lambda bundles `src/lib/financial-management/**` at deploy time, so any
  change to `integrator/`, `providers/`, `store/`, or `expenses.ts` needs a CDK
  deploy too, not just a Vercel one. Run `cdk diff` first: an existing table
  must never show as replaced or destroyed.
- Names are explicit, with no CDK-generated suffixes: tables `Financial*`,
  everything else `financial-management-*` (the DLQ is the one exception).

  ```bash
  set -a; source <(grep '^PLAID_' ../.env.local); set +a
  AWS_PROFILE=portfolio-dev npx cdk deploy FinancialManagementStack
  ```

**Running the Lambda by hand.** `{"mode":"daily"}` rewrites
`FinancialHoldingsCurrent`, upserts imported contributions, and syncs expenses
(safe any time); `{"mode":"weekly"}` also writes
today's History/Net Worth rows, so only run it on a Saturday or when you
mean to.

```bash
aws lambda invoke --function-name financial-management-sync \
  --payload '{"mode":"daily"}' --cli-binary-format raw-in-base64-out \
  --profile portfolio-dev --region us-west-2 /tmp/out.json
```

**Reading what's stored.** `aws dynamodb scan --table-name <Table>` with
the profile/region flags. `FinancialHoldingsCurrent` is one item keyed
`{"id":{"S":"current"}}`. `FinancialPlaidItems` rows contain `accessToken`
— strip it before printing anything.

**Calling Plaid directly (read-only).** Useful to check whether what's
stored matches what Plaid/Fidelity says right now. The installed `plaid`
SDK (v51) has a different shape from the one in Plaid's online docs
(`new PlaidClient(...)`, namespaced calls like
`plaidClient.investments.getHoldings`), so for ad-hoc checks plain REST is
simplest:

```bash
set -a; source <(grep '^PLAID_' .env.local); set +a
TOKEN=$(aws dynamodb get-item --table-name FinancialPlaidItems \
  --key '{"itemId":{"S":"<itemId>"}}' --profile portfolio-dev --region us-west-2 \
  --query 'Item.accessToken.S' --output text)
curl -s -X POST "https://$PLAID_ENV.plaid.com/accounts/balance/get" \
  -H 'Content-Type: application/json' \
  -d "{\"client_id\":\"$PLAID_CLIENT_ID\",\"secret\":\"$PLAID_SECRET\",\"access_token\":\"$TOKEN\"}" \
  | jq '.accounts[] | {mask, name, subtype, current: .balances.current, available: .balances.available}'
```

`/accounts/get` (shared accounts, cached balances) and `/item/get` (last
successful update, webhook) are free. `/item/get` and `/accounts/get` can look
healthy while a live call fails with `ITEM_LOGIN_REQUIRED`, so use
`/accounts/balance/get` once when a connection is in doubt.

Swap the path for `/investments/holdings/get` (cached holdings) or
`/investments/transactions/get` (add `start_date`, `end_date`,
`options: {count, offset}`; paginate until `total_investment_transactions`).
`/accounts/balance/get` is billed per call.

**Correcting stored data.** Back up first (`aws dynamodb scan ... >
backup.json`), then `update-item` the specific rows. There's no migration
tooling; History/Net Worth rows are plain items keyed by `date`.

## Current data state (as of 2026-11-23)

Fidelity Item `6wJ68xEALqSeN37EJAEEsEzBPgnMr5U0jQO9R` exposes four accounts:

| Mask | Name | Plaid subtype | Notes |
|---|---|---|---|
| 0094 | Individual - TOD | brokerage | Main taxable account. Core cash is SPAXX, which Plaid does **not** itemize — it appears via `reconcileCashHoldings`, and is not the same as `balances.available` (see Open items). Opened 2025-10-14, so `/investments/transactions/get` over 24 months covers its full history. |
| 2233 | AMAZON 401(K) PLAN | 401k | Collective trust funds (`SSGA.LG.CAP.GROWTH`, `VANG.INST.500.IDX.TR`) — no public tickers, so no external quote source can price them. |
| 4441 | AMAZON RSU | `stock plan` in holdings, `brokerage` in balance/get | Full grant (vested + unvested). Counted at **$0** today: no `transfer`/`transfer` vest transactions have been seen, so `vestedSharesByAccount` is empty. The owner confirmed on 2026-11-23 that nothing has vested. Verify vest detection when the next vest lands. |
| 8139 | Individual - TOD | brokerage | Empty ($0). |

Chase and Bank of America are separate `transactions`-product Items, feeding
Net Worth (checking only) and Expenses (all accounts):

| Bank | Item | Accounts |
|---|---|---|
| Chase | `q4jO4R5aamUe8JNXQvjeSVO338NPvJFNnVv90` | card 3572, checking 9786 |
| Bank of America | `kVmxBe4EQzuzdweeD1NeIO91Jby7XmT9KZAeX` | checking 1707, card 4464 |

**Expenses:** migrated 2026-11-23 from the old app, every field verified equal:
August 92 rows $4,987.67, September 82 rows $4,178.74, October 139 rows
$7,234.92. November was restarted from zero at the owner's request. The last
three rows auto-excluded before that rule was removed (2026-11-02 Fidelity
$25,000; 11-09 $499.03; 11-23 $2,443.11) were left excluded and still carry
an unused `autoExcluded` attribute. Some migrated rows carry other attributes
of the old app (`gsi1pk`, `splitDetails`, `effectiveAmount`…); nothing reads them.

**Data corrections made:**
- 2026-11-21 History/Net Worth rows were rewritten from the cached-holdings
  value ($93,267.34) to the live balance value ($88,894.44; Net Worth total
  $141,410.05).
- 2026-11-09 (written by the initial link, a Monday) and 2026-11-14 were
  computed from cached holdings prices and are probably overstated by a few
  thousand dollars. They're intentionally kept; there's no way to recover
  the live balance for a past date.

**Contributions:** 11 real-dated rows imported from Plaid on 2026-11-21
(Fidelity …0094: 7 deposits/withdrawals, net $94,950 from 2025-10-15;
401(k): 4 monthly contributions from 2026-08-04, $2,495.86), total
$97,445.86. They replaced two hand-entered rows dated 2026-11-09 ($94,000
and $2,495.86) that lumped everything on the link date.

**Settlement timing, for reference:** Fidelity books a trade on trade date
and moves SPAXX on settlement (T+1), so SPAXX alone overstates cash between
the two. The app is unaffected because it derives cash as
`balances.current − itemized holdings`, and `current` is Fidelity's own
netted account total.

## Open items

- **Fidelity data lags about a trading day.** Plaid didn't update at all on
  Monday 2026-11-23; the next update came 11-24 08:36 PT and matched the
  Fidelity app's 11-23 close to the cent, so no Reconnect was needed. Trades show only after Plaid's next update (the 11-20 buys
  appeared on 11-24).
- **`balances.available` is not the cash to show.** On 2026-11-21 it read
  $24,830.22 while $7,601.01 of Friday buys were unsettled; actual cash was
  $17,229.21 (the balance minus all positions at the close). Cash is
  `balances.current − itemized holdings`, and is right only when both come
  from the same close: on 11-23 the tab showed $20,559.48 because the balance
  was Friday's close but the holdings were older. Open question: reconcile both at one
  close. Don't switch to `available`.
- Delivery of the transactions webhook hasn't been observed in production yet.
  Opening the tab and the daily run cover for it.

- XIRR on Portfolio History is deferred: a test calculation gave 445%
  because contributions were lumped on one date. Contributions now carry
  real dates (see above), so it can be revisited.
- RSU vest detection hasn't been observed working against real data yet
  (see the 4441 row above). When the next vest lands, check that it shows up
  as a `transfer`/`transfer` transaction on the RSU account and moves
  `vestedSharesByAccount` off zero, and that selling vested shares and
  moving the cash to the brokerage account doesn't get imported as a new
  contribution.

## External references

- Plaid Investments (holdings, transactions, refresh): https://plaid.com/docs/api/products/investments/
- Plaid Accounts / balances field semantics: https://plaid.com/docs/api/accounts/
- Plaid Balance (`/accounts/balance/get`): https://plaid.com/docs/api/products/balance/
- Plaid webhooks and verification: https://plaid.com/docs/api/webhooks/ , https://plaid.com/docs/api/webhooks/webhook-verification/
- Fidelity balance definitions (core vs. cash available to trade/withdraw): https://fidelity.com/products/stocksbonds/content/cash-available-to-trade.shtml , https://www.fidelity.com/trading/faqs-about-account
- Yahoo chart endpoint used for ^SP500TR (unofficial, undocumented): `https://query1.finance.yahoo.com/v8/finance/chart/%5ESP500TR?period1=<unix>&period2=<unix>&interval=1d`
- EventBridge Scheduler cron syntax: https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html

