import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, NET_WORTH_TABLE } from "../dynamodb-client";
import type { NetWorthEntry } from "../types";

export async function listNetWorth(): Promise<NetWorthEntry[]> {
  const result = await docClient.send(new ScanCommand({ TableName: NET_WORTH_TABLE }));
  return ((result.Items ?? []) as NetWorthEntry[]).sort((a, b) => b.date.localeCompare(a.date));
}

export async function recordNetWorth(entry: NetWorthEntry): Promise<void> {
  await docClient.send(new PutCommand({ TableName: NET_WORTH_TABLE, Item: entry }));
}
