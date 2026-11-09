import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, PORTFOLIO_HISTORY_TABLE } from "../dynamodb-client";
import type { PortfolioHistoryEntry } from "../types";

export async function listPortfolioHistory(): Promise<PortfolioHistoryEntry[]> {
  const result = await docClient.send(new ScanCommand({ TableName: PORTFOLIO_HISTORY_TABLE }));
  return ((result.Items ?? []) as PortfolioHistoryEntry[]).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}

export async function recordPortfolioHistory(entry: PortfolioHistoryEntry): Promise<void> {
  await docClient.send(new PutCommand({ TableName: PORTFOLIO_HISTORY_TABLE, Item: entry }));
}
