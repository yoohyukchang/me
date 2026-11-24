import { DeleteCommand, GetCommand, PutCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, PLAID_ITEMS_TABLE } from "../dynamodb-client";
import type { ItemProduct, PlaidItem, PublicPlaidItem } from "../types";

export async function listPlaidItems(): Promise<PlaidItem[]> {
  const result = await docClient.send(new ScanCommand({ TableName: PLAID_ITEMS_TABLE }));
  return (result.Items ?? []) as PlaidItem[];
}

export async function listPublicPlaidItems(): Promise<PublicPlaidItem[]> {
  const items = await listPlaidItems();
  // Explicit allow-list, not a deny-list, so a new field defaults to hidden
  // rather than accidentally leaking (the access token stays server-only).
  return items.map((item) => ({
    itemId: item.itemId,
    institutionId: item.institutionId,
    institutionName: item.institutionName,
    product: item.product,
    status: item.status,
    lastError: item.lastError,
    lastSyncedAt: item.lastSyncedAt,
    currentBalance: item.currentBalance,
    investmentTransactionsSince: item.investmentTransactionsSince,
    vestedSharesByAccount: item.vestedSharesByAccount,
    vestedSharesLedger: item.vestedSharesLedger,
    createdAt: item.createdAt,
    knownAccounts: item.knownAccounts,
    missingAccounts: item.missingAccounts,
    lastExpenseSyncAt: item.lastExpenseSyncAt,
    expenseSyncError: item.expenseSyncError,
  }));
}

export async function getPlaidItem(itemId: string): Promise<PlaidItem | undefined> {
  const result = await docClient.send(
    new GetCommand({ TableName: PLAID_ITEMS_TABLE, Key: { itemId } })
  );
  return result.Item as PlaidItem | undefined;
}

export async function createPlaidItem(input: {
  itemId: string;
  institutionId: string;
  institutionName: string;
  product: ItemProduct;
  accessToken: string;
}): Promise<PlaidItem> {
  const item: PlaidItem = {
    ...input,
    status: "active",
    lastError: null,
    lastSyncedAt: null,
    currentBalance: null,
    investmentTransactionsSince: null,
    vestedSharesByAccount: {},
    vestedSharesLedger: {},
    createdAt: new Date().toISOString(),
  };
  await docClient.send(new PutCommand({ TableName: PLAID_ITEMS_TABLE, Item: item }));
  return item;
}

export async function recordSyncSuccess(
  itemId: string,
  update: Partial<
    Pick<
      PlaidItem,
      "currentBalance" | "investmentTransactionsSince" | "vestedSharesByAccount" | "vestedSharesLedger"
    >
  >
): Promise<void> {
  const updates: string[] = ["#status = :status", "#lastSyncedAt = :lastSyncedAt", "#lastError = :lastError"];
  const names: Record<string, string> = { "#status": "status", "#lastSyncedAt": "lastSyncedAt", "#lastError": "lastError" };
  const values: Record<string, unknown> = {
    ":status": "active",
    ":lastSyncedAt": new Date().toISOString(),
    ":lastError": null,
  };

  for (const field of [
    "currentBalance",
    "investmentTransactionsSince",
    "vestedSharesByAccount",
    "vestedSharesLedger",
  ] as const) {
    if (update[field] !== undefined) {
      updates.push(`#${field} = :${field}`);
      names[`#${field}`] = field;
      values[`:${field}`] = update[field];
    }
  }

  await docClient.send(
    new UpdateCommand({
      TableName: PLAID_ITEMS_TABLE,
      Key: { itemId },
      UpdateExpression: `SET ${updates.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    })
  );
}

export async function recordSyncFailure(itemId: string, error: string): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: PLAID_ITEMS_TABLE,
      Key: { itemId },
      UpdateExpression: "SET #status = :status, #lastError = :lastError",
      ExpressionAttributeNames: { "#status": "status", "#lastError": "lastError" },
      ExpressionAttributeValues: { ":status": "error", ":lastError": error },
    })
  );
}

export async function markLoginRequired(itemId: string): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: PLAID_ITEMS_TABLE,
      Key: { itemId },
      UpdateExpression: "SET #status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": "login_required" },
    })
  );
}

export async function deletePlaidItem(itemId: string): Promise<void> {
  await docClient.send(new DeleteCommand({ TableName: PLAID_ITEMS_TABLE, Key: { itemId } }));
}

const EXPENSE_SYNC_LOCK_MS = 90_000;

/** Takes the Item for one expense sync, or returns undefined if another run holds it (or it's gone). */
export async function claimExpenseSync(itemId: string): Promise<PlaidItem | undefined> {
  const now = Date.now();
  try {
    const result = await docClient.send(
      new UpdateCommand({
        TableName: PLAID_ITEMS_TABLE,
        Key: { itemId },
        UpdateExpression: "SET expenseSyncLockUntil = :until",
        ConditionExpression:
          "attribute_exists(itemId) AND #product = :transactions AND (attribute_not_exists(expenseSyncLockUntil) OR expenseSyncLockUntil < :now)",
        ExpressionAttributeNames: { "#product": "product" },
        ExpressionAttributeValues: { ":until": now + EXPENSE_SYNC_LOCK_MS, ":now": now, ":transactions": "transactions" },
        ReturnValues: "ALL_NEW",
      })
    );
    return result.Attributes as PlaidItem;
  } catch (error) {
    if ((error as Error).name === "ConditionalCheckFailedException") return undefined;
    throw error;
  }
}

export async function recordExpenseSyncSuccess(
  itemId: string,
  update: Required<Pick<PlaidItem, "transactionsCursor" | "knownAccounts" | "missingAccounts">>
): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: PLAID_ITEMS_TABLE,
      Key: { itemId },
      UpdateExpression:
        "SET transactionsCursor = :cursor, knownAccounts = :known, missingAccounts = :missing, lastExpenseSyncAt = :at, expenseSyncError = :none REMOVE expenseSyncLockUntil",
      ConditionExpression: "attribute_exists(itemId)",
      ExpressionAttributeValues: {
        ":cursor": update.transactionsCursor,
        ":known": update.knownAccounts,
        ":missing": update.missingAccounts,
        ":at": new Date().toISOString(),
        ":none": null,
      },
    })
  );
}

export async function recordExpenseSyncFailure(itemId: string, error: string): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: PLAID_ITEMS_TABLE,
      Key: { itemId },
      UpdateExpression: "SET expenseSyncError = :error REMOVE expenseSyncLockUntil",
      ConditionExpression: "attribute_exists(itemId)",
      ExpressionAttributeValues: { ":error": error },
    })
  );
}
