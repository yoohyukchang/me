const test = require("node:test");
const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");

const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "fm-holdings-reconcile-test-"));
execSync(
  `npx tsc src/lib/financial-management/providers/plaid/cash-reconciliation.ts --outDir "${outDir}" ` +
    `--module commonjs --target es2020 --moduleResolution node --esModuleInterop`,
  { cwd: path.join(__dirname, ".."), stdio: "inherit" }
);
const { reconcileCashHoldings } = require(path.join(outDir, "providers", "plaid", "cash-reconciliation.js"));

test("a reported balance exceeding declared holdings adds a cash holding for the gap", () => {
  const holdings = [{ securityId: "s1", accountId: "a1", quantity: 1, institutionPrice: 100, institutionValue: 100, vestedQuantity: null, vestedValue: null }];
  const { holdings: result, securities } = reconcileCashHoldings(
    [{ accountId: "a1", currentBalance: 133.63 }],
    holdings,
    []
  );
  assert.equal(result.length, 2);
  const cash = result.find((h) => h.accountId === "a1" && h.securityId !== "s1");
  assert.ok(Math.abs(cash.institutionValue - 33.63) < 1e-9);
  assert.equal(cash.institutionPrice, 1);
  assert.equal(securities[0].isCashEquivalent, true);
});

test("a balance that matches declared holdings exactly adds nothing", () => {
  const holdings = [{ securityId: "s1", accountId: "a1", quantity: 1, institutionPrice: 100, institutionValue: 100, vestedQuantity: null, vestedValue: null }];
  const { holdings: result } = reconcileCashHoldings([{ accountId: "a1", currentBalance: 100 }], holdings, []);
  assert.equal(result.length, 1);
});

test("a tiny negative residual (rounding noise) is ignored, not treated as negative cash", () => {
  const holdings = [{ securityId: "s1", accountId: "a1", quantity: 1, institutionPrice: 100, institutionValue: 100, vestedQuantity: null, vestedValue: null }];
  const { holdings: result } = reconcileCashHoldings([{ accountId: "a1", currentBalance: 99.995 }], holdings, []);
  assert.equal(result.length, 1);
});

test("a null balance is treated as zero, never fabricating negative cash", () => {
  const holdings = [{ securityId: "s1", accountId: "a1", quantity: 1, institutionPrice: 100, institutionValue: 100, vestedQuantity: null, vestedValue: null }];
  const { holdings: result } = reconcileCashHoldings([{ accountId: "a1", currentBalance: null }], holdings, []);
  assert.equal(result.length, 1);
});

test("each account is reconciled independently", () => {
  const holdings = [
    { securityId: "s1", accountId: "a1", quantity: 1, institutionPrice: 50, institutionValue: 50, vestedQuantity: null, vestedValue: null },
  ];
  const { holdings: result } = reconcileCashHoldings(
    [
      { accountId: "a1", currentBalance: 50 },
      { accountId: "a2", currentBalance: 200 },
    ],
    holdings,
    []
  );
  assert.equal(result.length, 2);
  const cash = result.find((h) => h.accountId === "a2");
  assert.equal(cash.institutionValue, 200);
});
