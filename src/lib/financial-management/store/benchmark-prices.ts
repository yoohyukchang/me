import { BatchWriteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { BENCHMARK_PRICES_TABLE, docClient } from "../dynamodb-client";
import type { BenchmarkPrice } from "../types";

export async function listBenchmarkPrices(symbol: string): Promise<BenchmarkPrice[]> {
  const items: BenchmarkPrice[] = [];
  let startKey: Record<string, unknown> | undefined;
  do {
    const result = await docClient.send(
      new QueryCommand({
        TableName: BENCHMARK_PRICES_TABLE,
        KeyConditionExpression: "#symbol = :symbol",
        ExpressionAttributeNames: { "#symbol": "symbol" },
        ExpressionAttributeValues: { ":symbol": symbol },
        ExclusiveStartKey: startKey,
      })
    );
    items.push(...((result.Items ?? []) as BenchmarkPrice[]));
    startKey = result.LastEvaluatedKey;
  } while (startKey);
  return items.sort((a, b) => a.date.localeCompare(b.date));
}

export async function saveBenchmarkPrices(prices: BenchmarkPrice[]): Promise<void> {
  for (let i = 0; i < prices.length; i += 25) {
    let requests = prices.slice(i, i + 25).map((Item) => ({ PutRequest: { Item } }));
    for (let attempt = 0; requests.length > 0 && attempt < 5; attempt++) {
      const result = await docClient.send(
        new BatchWriteCommand({ RequestItems: { [BENCHMARK_PRICES_TABLE]: requests } })
      );
      requests = (result.UnprocessedItems?.[BENCHMARK_PRICES_TABLE] ?? []) as typeof requests;
    }
    if (requests.length > 0) throw new Error("Benchmark prices: unprocessed writes after retries");
  }
}
