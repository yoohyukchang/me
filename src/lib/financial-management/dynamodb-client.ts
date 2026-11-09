import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// The Next.js app (on Vercel, no IAM role of its own) authenticates with the
// scoped access key below. The Lambda runs under its own execution role and
// sets neither var, so the SDK's default credential provider chain picks up
// that role automatically.
const explicitAccessKeyId = process.env.FINANCIAL_MANAGEMENT_AWS_ACCESS_KEY_ID;

const client = new DynamoDBClient({
  region: process.env.FINANCIAL_MANAGEMENT_AWS_REGION || process.env.AWS_REGION,
  ...(explicitAccessKeyId
    ? {
        credentials: {
          accessKeyId: explicitAccessKeyId,
          secretAccessKey: process.env.FINANCIAL_MANAGEMENT_AWS_SECRET_ACCESS_KEY!,
        },
      }
    : {}),
});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

export const PLAID_ITEMS_TABLE =
  process.env.FINANCIAL_MANAGEMENT_PLAID_ITEMS_TABLE || "FinancialPlaidItems";
export const VIEWS_TABLE =
  process.env.FINANCIAL_MANAGEMENT_VIEWS_TABLE || "FinancialHoldingsViews";
export const CATEGORIES_TABLE =
  process.env.FINANCIAL_MANAGEMENT_CATEGORIES_TABLE || "FinancialHoldingsViewCategories";
export const ASSIGNMENTS_TABLE =
  process.env.FINANCIAL_MANAGEMENT_ASSIGNMENTS_TABLE || "FinancialHoldingsAssignments";
export const HOLDINGS_CURRENT_TABLE =
  process.env.FINANCIAL_MANAGEMENT_HOLDINGS_CURRENT_TABLE || "FinancialHoldingsCurrent";
export const PORTFOLIO_HISTORY_TABLE =
  process.env.FINANCIAL_MANAGEMENT_PORTFOLIO_HISTORY_TABLE || "FinancialPortfolioHistory";
export const NET_WORTH_TABLE =
  process.env.FINANCIAL_MANAGEMENT_NET_WORTH_TABLE || "FinancialNetWorth";
export const MANUAL_HOLDINGS_TABLE =
  process.env.FINANCIAL_MANAGEMENT_MANUAL_HOLDINGS_TABLE || "FinancialManualHoldings";
export const CONTRIBUTIONS_TABLE =
  process.env.FINANCIAL_MANAGEMENT_CONTRIBUTIONS_TABLE || "FinancialContributions";
