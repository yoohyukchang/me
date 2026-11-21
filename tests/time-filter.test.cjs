const test = require("node:test");
const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");

const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "fm-time-filter-test-"));
execSync(
  `npx tsc src/lib/financial-management/time-filter.ts --outDir "${outDir}" ` +
    `--module commonjs --target es2020 --moduleResolution node --esModuleInterop`,
  { cwd: path.join(__dirname, ".."), stdio: "inherit" }
);
const { applyTimeFilter } = require(path.join(outDir, "time-filter.js"));

const points = ["2025-11-08", "2026-01-03", "2026-01-31", "2026-05-02", "2026-11-14", "2026-11-21"].map((date) => ({ date }));
const dates = (ps) => ps.map((p) => p.date);
const filter = (over) => ({ granularity: "week", preset: "all", from: "", to: "", ...over });

test("all/week keeps every point, ascending", () => {
  assert.deepEqual(dates(applyTimeFilter([...points].reverse(), filter(), "2026-11-21")), dates(points));
});

test("month keeps the last snapshot of each month", () => {
  assert.deepEqual(dates(applyTimeFilter(points, filter({ granularity: "month" }), "2026-11-21")), [
    "2025-11-08",
    "2026-01-31",
    "2026-05-02",
    "2026-11-21",
  ]);
});

test("presets cut from the right start date", () => {
  assert.deepEqual(dates(applyTimeFilter(points, filter({ preset: "ytd" }), "2026-11-21")), dates(points.slice(1)));
  assert.deepEqual(dates(applyTimeFilter(points, filter({ preset: "6m" }), "2026-11-21")), ["2026-11-14", "2026-11-21"]);
  assert.deepEqual(dates(applyTimeFilter(points, filter({ preset: "1y" }), "2026-11-21")), dates(points.slice(1)));
});

test("custom range is inclusive on both ends", () => {
  assert.deepEqual(
    dates(applyTimeFilter(points, filter({ preset: "custom", from: "2026-01-03", to: "2026-05-02" }), "2026-11-21")),
    ["2026-01-03", "2026-01-31", "2026-05-02"]
  );
});
