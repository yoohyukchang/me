const test = require("node:test");
const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");

const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "fm-vesting-test-"));
execSync(
  `npx tsc src/lib/financial-management/integrator/vesting.ts --outDir "${outDir}" ` +
    `--module commonjs --target es2020 --moduleResolution node --esModuleInterop`,
  { cwd: path.join(__dirname, ".."), stdio: "inherit" }
);
const { reconcileVestedShares } = require(path.join(outDir, "vesting.js"));

test("reconcileVestedShares accumulates a new vest by account", () => {
  const { deltasByAccount, ledger } = reconcileVestedShares({}, [
    { transactionId: "v1", accountId: "acctA", quantity: 100 },
  ]);
  assert.deepEqual(deltasByAccount, { acctA: 100 });
  assert.deepEqual(ledger, { v1: 100 });
});

test("reconcileVestedShares is idempotent against re-seeing the same vest", () => {
  const { deltasByAccount, ledger } = reconcileVestedShares({ v1: 100 }, [
    { transactionId: "v1", accountId: "acctA", quantity: 100 },
  ]);
  assert.deepEqual(deltasByAccount, { acctA: 0 });
  assert.deepEqual(ledger, { v1: 100 });
});

test("reconcileVestedShares buckets multiple accounts independently", () => {
  const { deltasByAccount } = reconcileVestedShares({}, [
    { transactionId: "v1", accountId: "acctA", quantity: 50 },
    { transactionId: "v2", accountId: "acctB", quantity: 30 },
  ]);
  assert.deepEqual(deltasByAccount, { acctA: 50, acctB: 30 });
});
