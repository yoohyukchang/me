export type Currency = "USD" | "KRW";

export function toUsd(amount: number, currency: Currency, rateWonPerUsd: number): number {
  return currency === "USD" ? amount : amount / rateWonPerUsd;
}

export type ItemStatus = "active" | "login_required" | "error";
export type ItemProduct = "investments" | "transactions";

export interface PlaidItem {
  itemId: string;
  institutionId: string;
  institutionName: string;
  product: ItemProduct;
  accessToken: string;
  status: ItemStatus;
  lastError: string | null;
  lastSyncedAt: string | null;
  /** Current balance for a `transactions`-product (depository) item, refreshed each sync — feeds Net Worth. */
  currentBalance: number | null;
  /** Last processed date (YYYY-MM-DD) for an `investments`-product item's vesting feed (/investments/transactions/get). */
  investmentTransactionsSince: string | null;
  /**
   * accountId -> cumulative vested share quantity observed from vest
   * transactions, stock-plan accounts only. Plaid/Fidelity reports no
   * vested-vs-unvested split for this account type (both fields come back
   * null), so this is how Portfolio Value only counts shares actually
   * vested rather than the full unvested grant.
   */
  vestedSharesByAccount: Record<string, number>;
  /** investment_transaction_id -> quantity already folded into vestedSharesByAccount. */
  vestedSharesLedger: Record<string, number>;
  createdAt: string;
}

export type PublicPlaidItem = Omit<PlaidItem, "accessToken">;

export interface Security {
  securityId: string;
  tickerSymbol: string | null;
  name: string;
  isCashEquivalent: boolean;
}

export interface Account {
  accountId: string;
  itemId: string;
  institutionName: string;
  name: string;
  subtype: string | null;
}

/**
 * How a Fidelity account is funded determines whether Portfolio Value can
 * count its full reported holding value — a 401k and an RSU stock plan
 * vest/accrue rather than being bought outright.
 */
export type AccountKind = "brokerage" | "retirement" | "stock_plan";

const RETIREMENT_SUBTYPES = new Set([
  "401a",
  "401k",
  "403B",
  "457b",
  "ira",
  "keogh",
  "lira",
  "pension",
  "profit sharing plan",
  "retirement",
  "roth 401k",
  "roth 403B",
  "roth 457b",
  "roth pension",
  "roth profit sharing plan",
  "roth thrift savings plan",
  "sep ira",
  "simple ira",
  "sipp",
  "thrift savings plan",
]);

// An employer stock-plan account (e.g. "AMAZON RSU") can come back from
// Plaid with subtype "brokerage" rather than the documented "stock plan" —
// the account name is the primary signal, with subtype as a fallback for
// institutions that do report it correctly.
const STOCK_PLAN_NAME_PATTERN = /\bRSU\b|\bESPP\b|STOCK PLAN/i;

export function classifyAccountKind(subtype: string | null, name: string): AccountKind {
  if (STOCK_PLAN_NAME_PATTERN.test(name) || subtype === "stock plan") return "stock_plan";
  if (subtype && RETIREMENT_SUBTYPES.has(subtype)) return "retirement";
  return "brokerage";
}

export interface Holding {
  securityId: string;
  accountId: string;
  quantity: number;
  institutionPrice: number;
  institutionValue: number;
  vestedQuantity: number | null;
  vestedValue: number | null;
}

export interface HoldingsSnapshot {
  accounts: Account[];
  holdings: Holding[];
  securities: Security[];
  totalValue: number;
  lastSyncedAt: string;
}

/**
 * A holding Plaid has no way to reach — a Korean brokerage account, or any
 * other account outside the connected providers. Priced and maintained by
 * hand, in whichever currency it's actually held in.
 */
export interface ManualHolding {
  id: string;
  ticker: string;
  name: string;
  accountName: string;
  shares: number;
  price: number;
  currency: Currency;
  order: number;
  updatedAt: string;
}

/**
 * The provider-agnostic shape every holding — Plaid or manual — is
 * presented as once merged. `holdingKey` is stable per holding (a Plaid
 * `security_id`, or a manual holding's own id) and is what Views/Categories
 * assign a category to, regardless of source.
 */
export interface UnifiedHolding {
  holdingKey: string;
  source: "plaid" | "manual";
  ticker: string | null;
  name: string;
  accountName: string;
  quantity: number;
  price: number;
  value: number;
  currency: Currency;
  valueUsd: number;
}

export interface View {
  id: string;
  name: string;
  order: number;
}

export interface Category {
  id: string;
  viewId: string;
  name: string;
  color: string;
  order: number;
}

export interface Assignment {
  viewId: string;
  holdingKey: string;
  categoryId: string;
  order: number;
}

/** A weekly, automatic fact: what the whole portfolio (Plaid + manual holdings) was worth. */
export interface PortfolioHistoryEntry {
  date: string;
  portfolioValue: number;
}

/**
 * Money moved into the portfolio from outside it — entered by hand, in
 * whichever currency it was actually contributed in, with the exchange
 * rate locked at entry time so later rate moves never rewrite past totals.
 */
export interface ContributionEntry {
  id: string;
  date: string;
  amount: number;
  currency: Currency;
  /** Won per $1 at entry time. 1 for USD entries. */
  rate: number;
  note: string;
}

export interface NetWorthEntry {
  date: string;
  /** institutionName -> balance, one entry per linked depository institution. Scales to more banks without a schema change. */
  depositoryBalances: Record<string, number>;
  fidelityValue: number;
  total: number;
  fxRateUsdKrw: number;
}

export function validDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
