import { randomUUID } from "crypto";
import { DeleteCommand, PutCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { CONTRIBUTIONS_TABLE, docClient } from "../dynamodb-client";
import type { ContributionEntry, Currency } from "../types";

export async function listContributions(): Promise<ContributionEntry[]> {
  const result = await docClient.send(new ScanCommand({ TableName: CONTRIBUTIONS_TABLE }));
  return ((result.Items ?? []) as ContributionEntry[]).sort((a, b) => a.date.localeCompare(b.date));
}

export async function createContribution(input: {
  date: string;
  amount: number;
  currency: Currency;
  rate: number;
  note: string;
}): Promise<ContributionEntry> {
  const entry: ContributionEntry = { id: randomUUID(), ...input };
  await docClient.send(new PutCommand({ TableName: CONTRIBUTIONS_TABLE, Item: entry }));
  return entry;
}

export async function updateContribution(
  id: string,
  input: Partial<Pick<ContributionEntry, "date" | "amount" | "currency" | "rate" | "note">>
): Promise<void> {
  const updates: string[] = [];
  const values: Record<string, unknown> = {};
  const names: Record<string, string> = {};

  const fields = ["date", "amount", "currency", "rate", "note"] as const;
  for (const field of fields) {
    if (input[field] !== undefined) {
      updates.push(`#${field} = :${field}`);
      names[`#${field}`] = field;
      values[`:${field}`] = input[field];
    }
  }
  if (updates.length === 0) return;

  await docClient.send(
    new UpdateCommand({
      TableName: CONTRIBUTIONS_TABLE,
      Key: { id },
      UpdateExpression: `SET ${updates.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    })
  );
}

export async function deleteContribution(id: string): Promise<void> {
  await docClient.send(new DeleteCommand({ TableName: CONTRIBUTIONS_TABLE, Key: { id } }));
}
