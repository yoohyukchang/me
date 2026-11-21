const test = require("node:test");
const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");

const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "fm-history-test-"));
execSync(
  `npx tsc src/lib/financial-management/portfolio-history.ts --outDir "${outDir}" ` +
    `--module commonjs --target es2020 --moduleResolution node --esModuleInterop`,
  { cwd: path.join(__dirname, ".."), stdio: "inherit" }
);
const { computeHistoryRows, benchmarkValueOn } = require(path.join(outDir, "portfolio-history.js"));

test("net contribution as of a date only counts contributions up to that date", () => {
  const entries = [
    { date: "2026-01-01", portfolioValue: 1000 },
    { date: "2026-02-01", portfolioValue: 1500 },
  ];
  const contributions = [
    { id: "c1", date: "2026-01-01", amount: 500, currency: "USD", rate: 1, note: "" },
    { id: "c2", date: "2026-01-15", amount: 500, currency: "USD", rate: 1, note: "" },
  ];
  const rows = computeHistoryRows(entries, contributions);
  const jan = rows.find((r) => r.date === "2026-01-01");
  const feb = rows.find((r) => r.date === "2026-02-01");
  assert.equal(jan.netContribution, 500);
  assert.equal(feb.netContribution, 1000);
});

test("a KRW contribution converts using its own locked rate", () => {
  const entries = [{ date: "2026-01-01", portfolioValue: 1000 }];
  const contributions = [{ id: "c1", date: "2026-01-01", amount: 1350000, currency: "KRW", rate: 1350, note: "" }];
  const rows = computeHistoryRows(entries, contributions);
  assert.equal(rows[0].netContribution, 1000);
});

test("total profit and return are derived from portfolio value minus net contribution", () => {
  const entries = [{ date: "2026-01-01", portfolioValue: 1200 }];
  const contributions = [{ id: "c1", date: "2026-01-01", amount: 1000, currency: "USD", rate: 1, note: "" }];
  const rows = computeHistoryRows(entries, contributions);
  assert.equal(rows[0].totalProfit, 200);
  assert.equal(rows[0].returnOnNetContribution, 20);
});

test("rows are sorted newest first", () => {
  const entries = [
    { date: "2026-01-01", portfolioValue: 100 },
    { date: "2026-03-01", portfolioValue: 300 },
    { date: "2026-02-01", portfolioValue: 200 },
  ];
  const rows = computeHistoryRows(entries, []);
  assert.deepEqual(rows.map((r) => r.date), ["2026-03-01", "2026-02-01", "2026-01-01"]);
});

test("zero net contribution gives zero return rather than throwing", () => {
  const entries = [{ date: "2026-01-01", portfolioValue: 500 }];
  const rows = computeHistoryRows(entries, []);
  assert.equal(rows[0].netContribution, 0);
  assert.equal(rows[0].returnOnNetContribution, 0);
});

const usd = (id, date, amount) => ({ id, date, amount, currency: "USD", rate: 1, note: "" });

test("benchmark buys index units at each contribution's close and values them at the snapshot close", () => {
  const prices = [
    { date: "2026-01-02", close: 100 },
    { date: "2026-02-02", close: 200 },
    { date: "2026-03-02", close: 150 },
  ];
  const contributions = [usd("c1", "2026-01-02", 1000), usd("c2", "2026-02-02", 1000)];
  // 10 units + 5 units = 15 units, valued at 150.
  assert.equal(benchmarkValueOn("2026-03-02", contributions, prices), 2250);
  // Only the first contribution counts before February.
  assert.equal(benchmarkValueOn("2026-01-31", contributions, prices), 1000);
});

test("a weekend contribution buys at the previous trading close", () => {
  const prices = [
    { date: "2026-01-02", close: 100 },
    { date: "2026-01-05", close: 110 },
  ];
  assert.equal(benchmarkValueOn("2026-01-05", [usd("c1", "2026-01-03", 1000)], prices), 1100);
});

test("a withdrawal sells index units at its date's close", () => {
  const prices = [
    { date: "2026-01-02", close: 100 },
    { date: "2026-02-02", close: 200 },
  ];
  const contributions = [usd("c1", "2026-01-02", 1000), usd("c2", "2026-02-02", -1000)];
  // 10 units − 5 units = 5 units at 200.
  assert.equal(benchmarkValueOn("2026-02-02", contributions, prices), 1000);
});

test("benchmark value is null without price data", () => {
  const rows = computeHistoryRows([{ date: "2026-01-01", portfolioValue: 1 }], [usd("c1", "2026-01-01", 1)]);
  assert.equal(rows[0].benchmarkValue, null);
});
