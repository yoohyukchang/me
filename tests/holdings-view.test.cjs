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
