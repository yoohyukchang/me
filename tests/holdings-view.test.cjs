const test = require("node:test");
const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");

const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "fm-holdings-view-test-"));
execSync(
  `npx tsc src/lib/financial-management/holdings-view.ts --outDir "${outDir}" ` +
    `--module commonjs --target es2020 --moduleResolution node --esModuleInterop`,
  { cwd: path.join(__dirname, ".."), stdio: "inherit" }
);
const { toUnifiedHoldings } = require(path.join(outDir, "holdings-view.js"));

const snapshot = {
  accounts: [{ accountId: "a1", itemId: "i1", institutionName: "Fidelity", name: "Individual - TOD", subtype: "brokerage" }],
  holdings: [{ securityId: "s1", accountId: "a1", quantity: 10, institutionPrice: 100, institutionValue: 1000, vestedQuantity: null, vestedValue: null }],
  securities: [{ securityId: "s1", tickerSymbol: "VOO", name: "Vanguard S&P 500 ETF", isCashEquivalent: false }],
};

test("a Plaid holding passes through as USD with no conversion", () => {
  const { holdings, totalValueUsd } = toUnifiedHoldings(snapshot, [], 1350);
  assert.equal(holdings.length, 1);
  assert.equal(holdings[0].source, "plaid");
  assert.equal(holdings[0].currency, "USD");
  assert.equal(holdings[0].valueUsd, 1000);
  assert.equal(totalValueUsd, 1000);
});

test("a manual KRW holding converts to USD using the given rate", () => {
  const manual = [
    { id: "m1", ticker: "005930", name: "Samsung Electronics", accountName: "Kiwoom", shares: 10, price: 70000, currency: "KRW", order: 0, updatedAt: "2026-01-01" },
  ];
  const { holdings, totalValueUsd } = toUnifiedHoldings(null, manual, 1400);
  assert.equal(holdings[0].value, 700000);
  assert.equal(holdings[0].currency, "KRW");
  assert.equal(holdings[0].valueUsd, 500);
  assert.equal(totalValueUsd, 500);
});

test("Plaid and manual holdings combine into one USD total", () => {
  const manual = [
    { id: "m1", ticker: "005930", name: "Samsung", accountName: "Kiwoom", shares: 1, price: 1400, currency: "KRW", order: 0, updatedAt: "2026-01-01" },
  ];
  const { totalValueUsd } = toUnifiedHoldings(snapshot, manual, 1400);
  assert.equal(totalValueUsd, 1001);
});

test("a null snapshot (no Plaid connection yet) still returns manual holdings", () => {
  const manual = [
    { id: "m1", ticker: "AAPL", name: "Apple", accountName: "Manual", shares: 2, price: 200, currency: "USD", order: 0, updatedAt: "2026-01-01" },
  ];
  const { holdings, totalValueUsd } = toUnifiedHoldings(null, manual, 0);
  assert.equal(holdings.length, 1);
  assert.equal(totalValueUsd, 400);
});

function priced(security, holding = {}) {
  return toUnifiedHoldings(
    {
      ...snapshot,
      holdings: [{ ...snapshot.holdings[0], institutionPriceAsOf: "2026-11-24", ...holding }],
      securities: [{ ...snapshot.securities[0], ...security }],
    },
    [],
    0
  ).holdings[0];
}

test("a holding is priced at the market close when there is one", () => {
  const row = priced({ closePrice: 110, closePriceAsOf: "2026-11-24" });
  assert.equal(row.price, 110);
  assert.ok(Math.abs(row.valueUsd - 1100) < 1e-9);
  assert.equal(row.closeDate, "2026-11-24");
});

test("no close, an old close, or a split-sized gap falls back to the institution's price", () => {
  for (const security of [
    { closePrice: null, closePriceAsOf: null },
    { closePrice: 110, closePriceAsOf: "2026-11-19" },
    { closePrice: 10, closePriceAsOf: "2026-11-24" },
    { closePrice: 1000, closePriceAsOf: "2026-11-24" },
  ]) {
    const row = priced(security);
    assert.equal(row.price, 100);
    assert.equal(row.valueUsd, 1000);
    assert.equal(row.closeDate, null);
  }
});

test("a close over a long weekend still counts", () => {
  assert.equal(priced({ closePrice: 110, closePriceAsOf: "2026-11-20" }).price, 110);
});

test("cash and a stock plan's unvested share aren't repriced into value", () => {
  assert.equal(priced({ isCashEquivalent: true, closePrice: 2, closePriceAsOf: "2026-11-24" }, { institutionPrice: 1 }).valueUsd, 1000);
  assert.equal(priced({ closePrice: 110, closePriceAsOf: "2026-11-24" }, { institutionValue: 0 }).valueUsd, 0);
});
