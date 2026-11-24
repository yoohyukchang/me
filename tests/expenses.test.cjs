const test = require("node:test");
const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");

const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "fm-expenses-test-"));
execSync(
  `npx tsc src/lib/financial-management/expenses.ts --outDir "${outDir}" ` +
    `--module commonjs --target es2020 --moduleResolution node --esModuleInterop`,
  { cwd: path.join(__dirname, ".."), stdio: "inherit" }
);
const E = require(path.join(outDir, "expenses.js"));

const NOW = "2026-11-24T00:00:00.000Z";
const accounts = [
  { accountId: "card", name: "Card", mask: "3572", type: "credit", subtype: "credit card" },
  { accountId: "chk", name: "Checking", mask: "9786", type: "depository", subtype: "checking" },
];
const bank = (o = {}) => ({
  transactionId: "t1", pendingTransactionId: null, accountId: "card", amount: 10, merchant: "Cafe",
  date: "2026-11-05", pending: false, ...o,
});
// Plans and applies, like the store would.
function run(existing, changes, accts = accounts) {
  const ops = E.planExpenseSync(existing, { added: [], modified: [], removed: [], ...changes }, accts, "Chase", NOW);
  const rows = new Map(existing.map((r) => [r.transactionId, r]));
  for (const op of ops) {
    if (op.kind === "delete") rows.delete(op.id);
    else {
      if (op.kind === "rekey") rows.delete(op.oldId);
      rows.set(op.row.transactionId, op.row);
    }
  }
  return { ops, rows: [...rows.values()] };
}
const imported = (o) => run([], { added: [bank(o)] }).rows[0];
const legacy = (o = {}) => ({
  transactionId: "old1", status: "APPROVED", merchantName: "Amazon", originalAmount: 15, date: "2026-10-31",
  categoryId: "c", accountId: "oldcard", institutionName: "Chase", isPending: false, importedAt: "x", updatedAt: "x", ...o,
});

test("history before the cutoff is never added to, changed, or removed", () => {
  const old = legacy();
  const { ops } = run([old], {
    added: [bank({ transactionId: "n", date: "2026-10-31" }), bank({ transactionId: "p", pendingTransactionId: "old1", date: "2026-11-01" })],
    modified: [bank({ transactionId: "old1", amount: 99, date: "2026-11-02" })],
    removed: ["old1"],
  });
  assert.deepEqual(ops, []);
});

test("a date correction can't move an open transaction into closed history", () => {
  const { rows } = run([imported()], { modified: [bank({ amount: 11, date: "2026-10-30" })] });
  assert.equal(rows[0].date, "2026-11-05");
});

test("November imports for review; replay is a no-op; refunds are skipped", () => {
  const first = run([], { added: [bank(), bank({ transactionId: "r", amount: -5 })] });
  assert.equal(first.rows.length, 1);
  assert.equal(first.rows[0].status, "PENDING_REVIEW");
  assert.deepEqual(run(first.rows, { added: [bank()] }).ops, []);
});

test("every outgoing transaction comes in for review; nothing is excluded by the sync", () => {
  const { rows } = run([], {
    added: [
      bank({ transactionId: "pay", accountId: "chk", merchant: "CHASE CREDIT CRD EPAY" }),
      bank({ transactionId: "fid", accountId: "chk", merchant: "Fidelity", amount: 25000 }),
      bank({ transactionId: "card" }),
    ],
  });
  assert.deepEqual(rows.map((r) => r.status), ["PENDING_REVIEW", "PENDING_REVIEW", "PENDING_REVIEW"]);
});

test("pending → posted keeps the review and hand-edited values, without duplicating", () => {
  const row = { ...imported({ pending: true }), status: "APPROVED", categoryId: "eat", originalAmount: 5, merchantName: "Split", date: "2026-11-04" };
  const { rows } = run([row], { added: [bank({ transactionId: "posted", pendingTransactionId: "t1" })], removed: ["t1"] });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].transactionId, "posted");
  assert.equal(rows[0].status, "APPROVED");
  assert.equal(rows[0].originalAmount, 5);
  assert.equal(rows[0].merchantName, "Split");
  assert.equal(rows[0].date, "2026-11-04");
  assert.equal(rows[0].isPending, false);
});

test("an amount the bank changes after approval comes back for review, and settles if it reverts", () => {
  const row = { ...imported(), status: "APPROVED" };
  const changed = run([row], { modified: [bank({ amount: 12 })] }).rows[0];
  assert.equal(changed.status, "PENDING_REVIEW");
  assert.deepEqual(changed.revision.changes, { originalAmount: { from: 10, to: 12 } });
  const reverted = run([changed], { modified: [bank()] }).rows[0];
  assert.equal(reverted.status, "APPROVED");
  assert.equal(reverted.revision, undefined);
});

test("re-linking the bank carries reviews and exclusions over instead of re-importing", () => {
  const a = { ...imported(), status: "EXCLUDED" };
  const b = { ...imported({ transactionId: "t2" }), status: "APPROVED" };
  const relinked = [{ ...accounts[0], accountId: "card2" }];
  const { rows } = run([a, b], {
    added: [bank({ transactionId: "n1", accountId: "card2" }), bank({ transactionId: "n2", accountId: "card2" }), bank({ transactionId: "n3", accountId: "card2" })],
  }, relinked);
  assert.deepEqual(rows.map((r) => r.status).sort(), ["APPROVED", "EXCLUDED", "PENDING_REVIEW"]);
});

test("removed: unreviewed goes away, approved posted comes back flagged, excluded stays excluded", () => {
  const rows = [
    imported(),
    { ...imported({ transactionId: "t2" }), status: "APPROVED" },
    { ...imported({ transactionId: "t3" }), status: "EXCLUDED" },
  ];
  const after = run(rows, { removed: ["t1", "t2", "t3"] }).rows;
  assert.deepEqual(after.map((r) => [r.transactionId, r.status]), [["t2", "PENDING_REVIEW"], ["t3", "EXCLUDED"]]);
  assert.equal(after[0].revision.removedByBank, true);
});

test("replaying a removal never deletes a row it already sent back to review", () => {
  const removed = { removed: ["t1"] };
  const once = run([{ ...imported(), status: "APPROVED" }], removed).rows;
  assert.deepEqual(run(once, removed).ops, []);
  const deferred = [{ ...once[0], status: "DEFERRED" }];
  assert.deepEqual(run(deferred, removed).ops, []);
});

test("an account the bank stops sharing is reported, and stays known", () => {
  const live = [accounts[1]];
  assert.deepEqual(E.findMissingAccounts(accounts, live).map((a) => a.mask), ["3572"]);
  assert.equal(E.mergeKnownAccounts(accounts, live).length, 2);
});

test("monthly totals use the calendar day as written, approved rows only", () => {
  const rows = [legacy({ date: "2026-10-01" }), legacy({ transactionId: "b", date: "2026-11-01" }), legacy({ transactionId: "c", date: "2026-10-15", status: "EXCLUDED" })];
  const s = E.summarizeMonth(rows, "2026-10");
  assert.equal(s.total, 15);
  assert.equal(s.count, 1);
  assert.equal(E.shiftMonth("2026-01", -1), "2025-12");
  assert.equal(E.daysInMonth("2026-10"), 31);
});
