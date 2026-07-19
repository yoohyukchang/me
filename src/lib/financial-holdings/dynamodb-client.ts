import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.FINANCIAL_HOLDINGS_AWS_REGION,
  credentials: {
    accessKeyId: process.env.FINANCIAL_HOLDINGS_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.FINANCIAL_HOLDINGS_AWS_SECRET_ACCESS_KEY!,
  },
});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

export const CATEGORIES_TABLE = process.env.FINANCIAL_HOLDINGS_CATEGORIES_TABLE!;
export const STOCKS_TABLE = process.env.FINANCIAL_HOLDINGS_STOCKS_TABLE!;
