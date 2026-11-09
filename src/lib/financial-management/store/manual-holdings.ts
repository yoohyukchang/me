import { randomUUID } from "crypto";
import { DeleteCommand, PutCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, MANUAL_HOLDINGS_TABLE } from "../dynamodb-client";
import type { Currency, ManualHolding } from "../types";

export async function listManualHoldings(): Promise<ManualHolding[]> {
  const result = await docClient.send(new ScanCommand({ TableName: MANUAL_HOLDINGS_TABLE }));
  return ((result.Items ?? []) as ManualHolding[]).sort((a, b) => a.order - b.order);
}

export async function createManualHolding(input: {
  ticker: string;
  name: string;
  accountName: string;
  shares: number;
  price: number;
  currency: Currency;
  order: number;
}): Promise<ManualHolding> {
  const holding: ManualHolding = { id: randomUUID(), updatedAt: new Date().toISOString(), ...input };
  await docClient.send(new PutCommand({ TableName: MANUAL_HOLDINGS_TABLE, Item: holding }));
  return holding;
}

export async function updateManualHolding(
  id: string,
  input: Partial<Pick<ManualHolding, "ticker" | "name" | "accountName" | "shares" | "price" | "currency">>
): Promise<void> {
  const updates: string[] = ["#updatedAt = :updatedAt"];
  const values: Record<string, unknown> = { ":updatedAt": new Date().toISOString() };
  const names: Record<string, string> = { "#updatedAt": "updatedAt" };

  const fields = ["ticker", "name", "accountName", "shares", "price", "currency"] as const;
  for (const field of fields) {
    if (input[field] !== undefined) {
      updates.push(`#${field} = :${field}`);
      names[`#${field}`] = field;
      values[`:${field}`] = input[field];
    }
  }

  await docClient.send(
    new UpdateCommand({
      TableName: MANUAL_HOLDINGS_TABLE,
      Key: { id },
      UpdateExpression: `SET ${updates.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    })
  );
}

export async function deleteManualHolding(id: string): Promise<void> {
  await docClient.send(new DeleteCommand({ TableName: MANUAL_HOLDINGS_TABLE, Key: { id } }));
}

export async function reorderManualHoldings(orderedIds: string[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, index) =>
      docClient.send(
        new UpdateCommand({
          TableName: MANUAL_HOLDINGS_TABLE,
          Key: { id },
          UpdateExpression: "SET #order = :order",
          ExpressionAttributeNames: { "#order": "order" },
          ExpressionAttributeValues: { ":order": index },
        })
      )
    )
  );
}
