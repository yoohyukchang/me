const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createRequire } = require("node:module");
const ts = require("typescript");

function load(file, mocks = {}) {
  const filename = path.resolve(__dirname, "..", file);
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  const localRequire = createRequire(filename);
  new Function("require", "module", "exports", output)(id => mocks[id] ?? localRequire(id), module, module.exports);
  return module.exports;
}

const { validSources, validDate } = load("src/lib/financial-holdings/net-worth.ts");
const source = { id: "bank-1", name: "Savings", kind: "asset", currency: "KRW", amount: 1350000, rate: 1350 };

test("validates sources, zero balances, and empty initial state", () => {
  assert.equal(validSources([]), true);
  assert.equal(validSources([source]), true);
  assert.equal(validSources([{ ...source, amount: 0, kind: "debt" }]), true);
  for (const change of [{ rate: 0 }, { rate: -1 }, { amount: null }, { amount: "10" }, { currency: "EUR" }, { name: " " }, { amount: -1 }, { rate: Infinity }]) {
    assert.equal(validSources([{ ...source, ...change }]), false);
  }
  assert.equal(validSources([source, source]), false);
  assert.equal(validSources([{ ...source, amount: 1e308, currency: "USD" }]), false);
  assert.equal(validSources(Array.from({ length: 101 }, (_, i) => ({ ...source, id: `source-${i}` }))), false);
});

test("accepts calendar dates without times and rejects impossible dates", () => {
  assert.equal(validDate("2024-02-29"), true);
  for (const date of ["2025-02-29", "2026-04-31", "2026-13-01", "2026-09-20T12:00:00Z", "9/20/2026", null]) assert.equal(validDate(date), false);
});

function storage(responses) {
  process.env.FINANCIAL_HOLDINGS_NET_WORTH_TABLE = "TestNetWorth";
  const calls = [];
  const data = load("src/lib/financial-holdings/net-worth-data.ts", { "./dynamodb-client": { docClient: { send: async command => {
    calls.push(command);
    const response = responses.shift();
    if (response instanceof Error) throw response;
    return response ?? {};
  } } } });
  return { data, calls };
}

test("new accounts load empty and source writes use optimistic concurrency", async () => {
  const { data, calls } = storage([{}, {}, {}]);
  assert.deepEqual(await data.getCurrentNetWorth(), { sources: [], revision: 0 });
  await data.saveNetWorthSources([{ ...source, extra: "ignored" }], 0);
  assert.equal(calls[1].input.ConditionExpression, "attribute_not_exists(id)");
  assert.equal(calls[1].input.Item.sources[0].extra, undefined);
  await data.saveNetWorthSources([], 1);
  assert.equal(calls[2].input.ExpressionAttributeValues[":revision"], 1);
  assert.equal(calls[2].input.Item.revision, 2);
});

test("snapshots atomically preserve server balances and rates with date only", async () => {
  const { data, calls } = storage([{ Item: { sources: [source], revision: 3 } }, {}]);
  const result = await data.recordNetWorth("2026-09-20", 3);
  assert.equal(result.revision, 4);
  assert.equal(result.snapshot.date, "2026-09-20");
  assert.deepEqual(result.snapshot.sources, [source]);
  assert.equal(result.snapshot.recordedAt, undefined);
  const transaction = calls[1].input.TransactItems;
  assert.equal(transaction[0].Update.ConditionExpression, "revision = :revision");
  assert.equal(transaction[0].Update.ExpressionAttributeValues[":revision"], 3);
  assert.equal(transaction[1].Put.Item, result.snapshot);
});

test("stale and empty snapshots are rejected before writing", async () => {
  for (const [current, revision, message] of [[{ sources: [source], revision: 2 }, 1, "NetWorthConflict"], [{ sources: [], revision: 2 }, 2, "NetWorthEmpty"]]) {
    const { data, calls } = storage([{ Item: current }]);
    await assert.rejects(data.recordNetWorth("2026-09-20", revision), new RegExp(message));
    assert.equal(calls.length, 1);
  }
});

test("history reads all DynamoDB pages and orders same-day records", async () => {
  const { data, calls } = storage([{ Items: [{ id: "old", order: 2 }], LastEvaluatedKey: { id: "cursor" } }, { Items: [{ id: "new", order: 5 }] }]);
  assert.deepEqual((await data.listNetWorthSnapshots()).map(s => s.id), ["new", "old"]);
  assert.deepEqual(calls[1].input.ExclusiveStartKey, { id: "cursor" });
});

test("CDK synthesizes retained on-demand storage, recovery, IAM access and output", () => {
  const cdk = require("../infra/node_modules/aws-cdk-lib");
  const { Template, Match } = require("../infra/node_modules/aws-cdk-lib/assertions");
  const { FinancialHoldingsStack } = load("infra/lib/financial-holdings-stack.ts");
  const app = new cdk.App({ outdir: fs.mkdtempSync(path.join(os.tmpdir(), "net-worth-cdk-")) });
  const stack = new FinancialHoldingsStack(app, "TestStack");
  const template = Template.fromStack(stack);
  template.hasResource("AWS::DynamoDB::Table", { DeletionPolicy: "Retain", Properties: Match.objectLike({ TableName: "FinancialHoldingsNetWorth", BillingMode: "PAY_PER_REQUEST", PointInTimeRecoverySpecification: { PointInTimeRecoveryEnabled: true } }) });
  const tables = template.findResources("AWS::DynamoDB::Table", { Properties: { TableName: "FinancialHoldingsNetWorth" } });
  const tableId = Object.keys(tables)[0];
  template.hasResourceProperties("AWS::IAM::Policy", { PolicyDocument: { Statement: Match.arrayWith([Match.objectLike({ Resource: Match.arrayWith([{ "Fn::GetAtt": [tableId, "Arn"] }]), Action: Match.arrayWith(["dynamodb:PutItem", "dynamodb:UpdateItem"]) })]) } });
  template.hasOutput("NetWorthTableName", { Value: { Ref: tableId } });
  app.synth();
});
