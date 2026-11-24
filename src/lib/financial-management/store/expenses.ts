import { randomUUID } from "crypto";
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
  TransactWriteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient, EXPENSE_CATEGORIES_TABLE, EXPENSE_TRANSACTIONS_TABLE } from "../dynamodb-client";
import type { ExpenseCategory, ExpenseOp, ExpenseTransaction } from "../expenses";

async function scanAll<T>(table: string): Promise<T[]> {
  const items: T[] = [];
  let start: Record<string, unknown> | undefined;
  do {
    const page = await docClient.send(
      new ScanCommand({ TableName: table, ExclusiveStartKey: start, ConsistentRead: true })
    );
    items.push(...((page.Items ?? []) as T[]));
    start = page.LastEvaluatedKey;
  } while (start);
  return items;
}

export async function listExpenses(): Promise<ExpenseTransaction[]> {
  const rows = await scanAll<ExpenseTransaction>(EXPENSE_TRANSACTIONS_TABLE);
  return rows.sort((a, b) => b.date.localeCompare(a.date) || a.transactionId.localeCompare(b.transactionId));
}

export async function getExpense(transactionId: string): Promise<ExpenseTransaction | undefined> {
  const result = await docClient.send(
    new GetCommand({ TableName: EXPENSE_TRANSACTIONS_TABLE, Key: { transactionId } })
  );
  return result.Item as ExpenseTransaction | undefined;
}

/** Every write is conditional on the row being as the caller read it, so a sync and a review can't overwrite each other. */
export async function applyExpenseOp(op: ExpenseOp): Promise<void> {
  const TableName = EXPENSE_TRANSACTIONS_TABLE;
  switch (op.kind) {
    case "insert":
      try {
        await docClient.send(
          new PutCommand({ TableName, Item: op.row, ConditionExpression: "attribute_not_exists(transactionId)" })
        );
      } catch (error) {
        if ((error as Error).name !== "ConditionalCheckFailedException") throw error;
      }
      return;
    case "update":
      await saveExpense(op.row, op.previousUpdatedAt);
      return;
    case "rekey":
      await docClient.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Delete: {
                TableName,
                Key: { transactionId: op.oldId },
                ConditionExpression: "updatedAt = :previous",
                ExpressionAttributeValues: { ":previous": op.previousUpdatedAt },
              },
            },
            { Put: { TableName, Item: op.row, ConditionExpression: "attribute_not_exists(transactionId)" } },
          ],
        })
      );
      return;
    case "delete":
      await docClient.send(
        new DeleteCommand({
          TableName,
          Key: { transactionId: op.id },
          ConditionExpression: "updatedAt = :previous",
          ExpressionAttributeValues: { ":previous": op.previousUpdatedAt },
        })
      );
  }
}

export async function saveExpense(row: ExpenseTransaction, previousUpdatedAt: string): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: EXPENSE_TRANSACTIONS_TABLE,
      Item: row,
      ConditionExpression: "updatedAt = :previous",
      ExpressionAttributeValues: { ":previous": previousUpdatedAt },
    })
  );
}

export async function createManualExpense(
  input: Pick<ExpenseTransaction, "merchantName" | "originalAmount" | "date" | "categoryId" | "notes" | "isSubscription">
): Promise<ExpenseTransaction> {
  const now = new Date().toISOString();
  const row: ExpenseTransaction = {
    transactionId: `manual_${randomUUID()}`,
    status: "PENDING_REVIEW",
    ...input,
    accountId: "manual",
    institutionName: "Cash",
    isPending: false,
    importedAt: now,
    updatedAt: now,
  };
  await docClient.send(new PutCommand({ TableName: EXPENSE_TRANSACTIONS_TABLE, Item: row }));
  return row;
}

export async function listExpenseCategories(): Promise<ExpenseCategory[]> {
  const categories = await scanAll<ExpenseCategory>(EXPENSE_CATEGORIES_TABLE);
  return categories.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createExpenseCategory(name: string, color: string): Promise<ExpenseCategory> {
  const now = new Date().toISOString();
  const category: ExpenseCategory = { categoryId: randomUUID(), name, color, createdAt: now, updatedAt: now };
  await docClient.send(new PutCommand({ TableName: EXPENSE_CATEGORIES_TABLE, Item: category }));
  return category;
}

export async function updateExpenseCategory(
  categoryId: string,
  input: { name?: string; color?: string }
): Promise<void> {
  const sets = ["updatedAt = :now"];
  const names: Record<string, string> = {};
  const values: Record<string, unknown> = { ":now": new Date().toISOString() };
  for (const field of ["name", "color"] as const) {
    if (input[field] === undefined) continue;
    sets.push(`#${field} = :${field}`);
    names[`#${field}`] = field;
    values[`:${field}`] = input[field];
  }
  await docClient.send(
    new UpdateCommand({
      TableName: EXPENSE_CATEGORIES_TABLE,
      Key: { categoryId },
      UpdateExpression: `SET ${sets.join(", ")}`,
      ConditionExpression: "attribute_exists(categoryId)",
      ...(Object.keys(names).length > 0 ? { ExpressionAttributeNames: names } : {}),
      ExpressionAttributeValues: values,
    })
  );
}

export async function deleteExpenseCategory(categoryId: string): Promise<void> {
  await docClient.send(new DeleteCommand({ TableName: EXPENSE_CATEGORIES_TABLE, Key: { categoryId } }));
}
