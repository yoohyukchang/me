const test = require("node:test");
const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");

const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "fm-types-test-"));
execSync(
  `npx tsc src/lib/financial-management/types.ts --outDir "${outDir}" ` +
    `--module commonjs --target es2020 --moduleResolution node --esModuleInterop`,
  { cwd: path.join(__dirname, ".."), stdio: "inherit" }
);
const { validDate, classifyAccountKind } = require(path.join(outDir, "types.js"));

test("validDate accepts a real calendar date", () => {
  assert.equal(validDate("2026-03-05"), true);
});

test("validDate rejects a non-existent calendar date", () => {
  assert.equal(validDate("2026-02-30"), false);
});

test("validDate rejects malformed strings", () => {
  assert.equal(validDate("2026/03/05"), false);
  assert.equal(validDate("not-a-date"), false);
  assert.equal(validDate(""), false);
});

test("validDate rejects non-string input", () => {
  assert.equal(validDate(20260305), false);
  assert.equal(validDate(null), false);
  assert.equal(validDate(undefined), false);
});

test("classifyAccountKind recognizes 401k-style retirement subtypes", () => {
  assert.equal(classifyAccountKind("401k", "AMAZON 401(K) PLAN"), "retirement");
  assert.equal(classifyAccountKind("403B", "403b plan"), "retirement");
  assert.equal(classifyAccountKind("roth 401k", "Roth 401k"), "retirement");
  assert.equal(classifyAccountKind("ira", "Rollover IRA"), "retirement");
});

test("classifyAccountKind recognizes an RSU stock plan account by subtype", () => {
  assert.equal(classifyAccountKind("stock plan", "Employee Stock Plan"), "stock_plan");
});

test("classifyAccountKind recognizes an RSU account by name even when Plaid reports subtype brokerage", () => {
  // Confirmed against real Fidelity data: "AMAZON RSU" comes back as
  // subtype "brokerage", not "stock plan" — the name has to carry this.
  assert.equal(classifyAccountKind("brokerage", "AMAZON RSU"), "stock_plan");
  assert.equal(classifyAccountKind("brokerage", "Company ESPP"), "stock_plan");
});

test("classifyAccountKind defaults unknown/brokerage subtypes to brokerage", () => {
  assert.equal(classifyAccountKind("brokerage", "Individual - TOD"), "brokerage");
  assert.equal(classifyAccountKind(null, "Individual - TOD"), "brokerage");
  assert.equal(classifyAccountKind("some future subtype", "Individual - TOD"), "brokerage");
});
