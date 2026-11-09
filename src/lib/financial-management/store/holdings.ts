import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, HOLDINGS_CURRENT_TABLE } from "../dynamodb-client";
import type { HoldingsSnapshot } from "../types";

const KEY = { id: "current" };

export async function getCurrentHoldings(): Promise<HoldingsSnapshot | undefined> {
  const result = await docClient.send(
    new GetCommand({ TableName: HOLDINGS_CURRENT_TABLE, Key: KEY })
  );
  return result.Item as HoldingsSnapshot | undefined;
}

export async function saveCurrentHoldings(snapshot: HoldingsSnapshot): Promise<void> {
  await docClient.send(
    new PutCommand({ TableName: HOLDINGS_CURRENT_TABLE, Item: { ...KEY, ...snapshot } })
  );
}
