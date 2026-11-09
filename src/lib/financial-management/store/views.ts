import { randomUUID } from "crypto";
import {
  DeleteCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { ASSIGNMENTS_TABLE, CATEGORIES_TABLE, docClient, VIEWS_TABLE } from "../dynamodb-client";
import type { Assignment, Category, View } from "../types";

export async function listViews(): Promise<View[]> {
  const result = await docClient.send(new ScanCommand({ TableName: VIEWS_TABLE }));
  return ((result.Items ?? []) as View[]).sort((a, b) => a.order - b.order);
}

export async function createView(name: string, order: number): Promise<View> {
  const view: View = { id: randomUUID(), name, order };
  await docClient.send(new PutCommand({ TableName: VIEWS_TABLE, Item: view }));
  return view;
}

export async function renameView(id: string, name: string): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: VIEWS_TABLE,
      Key: { id },
      UpdateExpression: "SET #name = :name",
      ExpressionAttributeNames: { "#name": "name" },
      ExpressionAttributeValues: { ":name": name },
    })
  );
}

export async function reorderViews(orderedIds: string[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, index) =>
      docClient.send(
        new UpdateCommand({
          TableName: VIEWS_TABLE,
          Key: { id },
          UpdateExpression: "SET #order = :order",
          ExpressionAttributeNames: { "#order": "order" },
          ExpressionAttributeValues: { ":order": index },
        })
      )
    )
  );
}

export async function deleteView(id: string): Promise<void> {
  const categories = await listCategories(id);
  const assignments = await listAssignments(id);
  await Promise.all([
    docClient.send(new DeleteCommand({ TableName: VIEWS_TABLE, Key: { id } })),
    ...categories.map((category) =>
      docClient.send(
        new DeleteCommand({ TableName: CATEGORIES_TABLE, Key: { viewId: id, id: category.id } })
      )
    ),
    ...assignments.map((assignment) =>
      docClient.send(
        new DeleteCommand({
          TableName: ASSIGNMENTS_TABLE,
          Key: { viewId: id, holdingKey: assignment.holdingKey },
        })
      )
    ),
  ]);
}

export async function listCategories(viewId: string): Promise<Category[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: CATEGORIES_TABLE,
      KeyConditionExpression: "viewId = :viewId",
      ExpressionAttributeValues: { ":viewId": viewId },
    })
  );
  return ((result.Items ?? []) as Category[]).sort((a, b) => a.order - b.order);
}

export async function createCategory(
  viewId: string,
  input: { name: string; color: string; order: number }
): Promise<Category> {
  const category: Category = { id: randomUUID(), viewId, ...input };
  await docClient.send(new PutCommand({ TableName: CATEGORIES_TABLE, Item: category }));
  return category;
}

export async function updateCategory(
  viewId: string,
  id: string,
  input: { name?: string; color?: string }
): Promise<void> {
  const updates: string[] = [];
  const names: Record<string, string> = {};
  const values: Record<string, unknown> = {};
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
      Key: { viewId, id },
      UpdateExpression: `SET ${updates.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    })
  );
}

export async function reorderCategories(viewId: string, orderedIds: string[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, index) =>
      docClient.send(
        new UpdateCommand({
          TableName: CATEGORIES_TABLE,
          Key: { viewId, id },
          UpdateExpression: "SET #order = :order",
          ExpressionAttributeNames: { "#order": "order" },
          ExpressionAttributeValues: { ":order": index },
        })
      )
    )
  );
}

export async function deleteCategory(viewId: string, id: string): Promise<void> {
  const assignments = await listAssignments(viewId);
  const affected = assignments.filter((a) => a.categoryId === id);
  await Promise.all([
    docClient.send(new DeleteCommand({ TableName: CATEGORIES_TABLE, Key: { viewId, id } })),
    ...affected.map((a) =>
      docClient.send(
        new DeleteCommand({ TableName: ASSIGNMENTS_TABLE, Key: { viewId, holdingKey: a.holdingKey } })
      )
    ),
  ]);
}

export async function listAssignments(viewId: string): Promise<Assignment[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: ASSIGNMENTS_TABLE,
      KeyConditionExpression: "viewId = :viewId",
      ExpressionAttributeValues: { ":viewId": viewId },
    })
  );
  return (result.Items ?? []) as Assignment[];
}

export async function setAssignment(
  viewId: string,
  holdingKey: string,
  categoryId: string
): Promise<void> {
  const assignment: Assignment = { viewId, holdingKey, categoryId };
  await docClient.send(new PutCommand({ TableName: ASSIGNMENTS_TABLE, Item: assignment }));
}

export async function deleteAssignment(viewId: string, holdingKey: string): Promise<void> {
  await docClient.send(new DeleteCommand({ TableName: ASSIGNMENTS_TABLE, Key: { viewId, holdingKey } }));
}
