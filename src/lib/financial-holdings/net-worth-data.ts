import { randomUUID } from "crypto";
import { GetCommand, PutCommand, ScanCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "./dynamodb-client";
import type { NetWorthSnapshot, NetWorthSource } from "./net-worth";

function tableName() {
  return process.env.FINANCIAL_HOLDINGS_NET_WORTH_TABLE || "FinancialHoldingsNetWorth";
}

export async function getCurrentNetWorth() {
  const result = await docClient.send(new GetCommand({ TableName: tableName(), Key: { id: "current" }, ConsistentRead: true }));
  return { sources: (result.Item?.sources ?? []) as NetWorthSource[], revision: (result.Item?.revision ?? 0) as number };
}

export async function listNetWorthSnapshots() {
  const snapshots: NetWorthSnapshot[] = [];
  let cursor: Record<string, unknown> | undefined;
  do {
    const result = await docClient.send(new ScanCommand({ TableName: tableName(), ConsistentRead: true,
      FilterExpression: "#id <> :current", ExpressionAttributeNames: { "#id": "id" }, ExpressionAttributeValues: { ":current": "current" }, ExclusiveStartKey: cursor }));
    snapshots.push(...(result.Items ?? []) as NetWorthSnapshot[]);
    cursor = result.LastEvaluatedKey;
  } while (cursor);
  return snapshots.sort((a, b) => b.order - a.order);
}

export async function saveNetWorthSources(sources: NetWorthSource[], revision: number) {
  // Explicit fields prevent arbitrary client properties from being persisted.
  const cleanSources = sources.map(({ id, name, kind, currency, amount, rate }) => ({ id, name: name.trim(), kind, currency, amount, rate }));
  const current = { id: "current", sources: cleanSources, revision: revision + 1 };
  await docClient.send(new PutCommand({ TableName: tableName(), Item: current,
    ConditionExpression: revision === 0 ? "attribute_not_exists(id)" : "revision = :revision",
    ...(revision === 0 ? {} : { ExpressionAttributeValues: { ":revision": revision } }) }));
  return current;
}

export async function recordNetWorth(date: string, revision: number) {
  const current = await getCurrentNetWorth();
  if (current.revision !== revision) throw new Error("NetWorthConflict");
  if (!current.sources.length) throw new Error("NetWorthEmpty");
  const snapshot: NetWorthSnapshot = { id: randomUUID(), date, sources: current.sources, order: revision + 1 };
  await docClient.send(new TransactWriteCommand({ TransactItems: [
    { Update: { TableName: tableName(), Key: { id: "current" }, UpdateExpression: "SET revision = :next", ConditionExpression: "revision = :revision", ExpressionAttributeValues: { ":next": revision + 1, ":revision": revision } } },
    { Put: { TableName: tableName(), Item: snapshot, ConditionExpression: "attribute_not_exists(id)" } },
  ] }));
  return { snapshot, revision: revision + 1 };
}
