import { randomUUID } from "crypto";
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { CATEGORIES_TABLE, docClient, HISTORY_TABLE, STOCKS_TABLE } from "./dynamodb-client";
import type { Category, HistoryEntry, Stock } from "./types";

export async function listCategories(): Promise<Category[]> {
  const result = await docClient.send(
    new ScanCommand({ TableName: CATEGORIES_TABLE })
  );
  return (result.Items ?? []) as Category[];
}

export async function createCategory(input: {
  name: string;
  color: string;
  order: number;
}): Promise<Category> {
  const category: Category = {
    id: randomUUID(),
    name: input.name,
    color: input.color,
    order: input.order,
  };
  await docClient.send(
    new PutCommand({ TableName: CATEGORIES_TABLE, Item: category })
  );
  return category;
}

export async function reorderCategories(orderedIds: string[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, index) =>
      docClient.send(
        new UpdateCommand({
          TableName: CATEGORIES_TABLE,
          Key: { id },
          UpdateExpression: "SET #order = :order",
          ExpressionAttributeNames: { "#order": "order" },
          ExpressionAttributeValues: { ":order": index },
        })
      )
    )
  );
}

export async function updateCategory(
  id: string,
  input: { name?: string; color?: string }
): Promise<void> {
  const updates: string[] = [];
  const values: Record<string, unknown> = {};
  const names: Record<string, string> = {};

  if (input.name !== undefined) {
    updates.push("#name = :name");
    names["#name"] = "name";
    values[":name"] = input.name;
  }
  if (input.color !== undefined) {
    updates.push("#color = :color");
    names["#color"] = "color";
    values[":color"] = input.color;
  }
  if (updates.length === 0) return;

  await docClient.send(
    new UpdateCommand({
      TableName: CATEGORIES_TABLE,
      Key: { id },
      UpdateExpression: `SET ${updates.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    })
  );
}

export async function deleteCategory(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({ TableName: CATEGORIES_TABLE, Key: { id } })
  );
}

export async function getCategory(id: string): Promise<Category | undefined> {
  const result = await docClient.send(
    new GetCommand({ TableName: CATEGORIES_TABLE, Key: { id } })
  );
  return result.Item as Category | undefined;
}

export async function listStocks(): Promise<Stock[]> {
  const result = await docClient.send(
    new ScanCommand({ TableName: STOCKS_TABLE })
  );
  return (result.Items ?? []) as Stock[];
}

export async function createStock(input: {
  ticker: string;
  name: string;
  shares: number;
  price: number;
  categoryId: string;
  order: number;
}): Promise<Stock> {
  const stock: Stock = {
    id: randomUUID(),
    ticker: input.ticker,
    name: input.name,
    shares: input.shares,
    price: input.price,
    categoryId: input.categoryId,
    updatedAt: new Date().toISOString(),
    order: input.order,
  };
  await docClient.send(new PutCommand({ TableName: STOCKS_TABLE, Item: stock }));
  return stock;
}

export async function reorderStocks(orderedIds: string[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, index) =>
      docClient.send(
        new UpdateCommand({
          TableName: STOCKS_TABLE,
          Key: { id },
          UpdateExpression: "SET #order = :order",
          ExpressionAttributeNames: { "#order": "order" },
          ExpressionAttributeValues: { ":order": index },
        })
      )
    )
  );
}

export async function updateStock(
  id: string,
  input: {
    ticker?: string;
    name?: string;
    shares?: number;
    price?: number;
    categoryId?: string;
  }
): Promise<void> {
  const updates: string[] = ["#updatedAt = :updatedAt"];
  const values: Record<string, unknown> = {
    ":updatedAt": new Date().toISOString(),
  };
  const names: Record<string, string> = { "#updatedAt": "updatedAt" };

  const fields: Array<keyof typeof input> = [
    "ticker",
    "name",
    "shares",
    "price",
    "categoryId",
  ];
  for (const field of fields) {
    if (input[field] !== undefined) {
      updates.push(`#${field} = :${field}`);
      names[`#${field}`] = field;
      values[`:${field}`] = input[field];
    }
  }

  await docClient.send(
    new UpdateCommand({
      TableName: STOCKS_TABLE,
      Key: { id },
      UpdateExpression: `SET ${updates.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    })
  );
}

export async function deleteStock(id: string): Promise<void> {
  await docClient.send(new DeleteCommand({ TableName: STOCKS_TABLE, Key: { id } }));
}

export async function listHistoryEntries(): Promise<HistoryEntry[]> {
  const result = await docClient.send(
    new ScanCommand({ TableName: HISTORY_TABLE })
  );
  return (result.Items ?? []) as HistoryEntry[];
}

export async function createHistoryEntry(input: {
  date: string;
  netContribution: number;
  portfolioValue: number;
}): Promise<HistoryEntry> {
  const entry: HistoryEntry = {
    id: randomUUID(),
    date: input.date,
    netContribution: input.netContribution,
    portfolioValue: input.portfolioValue,
  };
  await docClient.send(new PutCommand({ TableName: HISTORY_TABLE, Item: entry }));
  return entry;
}

export async function updateHistoryEntry(
  id: string,
  input: {
    date?: string;
    netContribution?: number;
    portfolioValue?: number;
  }
): Promise<void> {
  const updates: string[] = [];
  const values: Record<string, unknown> = {};
  const names: Record<string, string> = {};

  const fields: Array<keyof typeof input> = ["date", "netContribution", "portfolioValue"];
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
      TableName: HISTORY_TABLE,
      Key: { id },
      UpdateExpression: `SET ${updates.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    })
  );
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  await docClient.send(new DeleteCommand({ TableName: HISTORY_TABLE, Key: { id } }));
}
