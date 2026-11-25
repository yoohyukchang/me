import * as path from "path";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as scheduler from "aws-cdk-lib/aws-scheduler";
import * as sqs from "aws-cdk-lib/aws-sqs";

const REPO_ROOT = path.join(__dirname, "../..");

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} must be set in the shell running "cdk deploy" (the Lambda needs it; it is never committed to source).`
    );
  }
  return value;
}

export class FinancialManagementStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Access tokens are the most sensitive thing this app stores, so they
    // get a dedicated customer-managed key instead of the default table
    // encryption the other tables use.
    const plaidItemsKey = new kms.Key(this, "PlaidItemsKey", {
      description: "Encrypts FinancialPlaidItems (Plaid access tokens)",
      alias: "financial-management-plaid-items",
      enableKeyRotation: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const plaidItemsTable = new dynamodb.Table(this, "PlaidItemsTable", {
      tableName: "FinancialPlaidItems",
      partitionKey: { name: "itemId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: plaidItemsKey,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const viewsTable = new dynamodb.Table(this, "ViewsTable", {
      tableName: "FinancialHoldingsViews",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Named ViewCategories, not just Categories, to stay clear of
    // "FinancialHoldingsCategories" — a different, incompatible schema.
    const categoriesTable = new dynamodb.Table(this, "CategoriesTable", {
      tableName: "FinancialHoldingsViewCategories",
      partitionKey: { name: "viewId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const assignmentsTable = new dynamodb.Table(this, "AssignmentsTable", {
      tableName: "FinancialHoldingsAssignments",
      partitionKey: { name: "viewId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "holdingKey", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const holdingsCurrentTable = new dynamodb.Table(this, "HoldingsCurrentTable", {
      tableName: "FinancialHoldingsCurrent",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const portfolioHistoryTable = new dynamodb.Table(this, "PortfolioHistoryTable", {
      tableName: "FinancialPortfolioHistory",
      partitionKey: { name: "date", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const netWorthTable = new dynamodb.Table(this, "NetWorthTable", {
      tableName: "FinancialNetWorth",
      partitionKey: { name: "date", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const manualHoldingsTable = new dynamodb.Table(this, "ManualHoldingsTable", {
      tableName: "FinancialManualHoldings",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const contributionsTable = new dynamodb.Table(this, "ContributionsTable", {
      tableName: "FinancialContributions",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const benchmarkPricesTable = new dynamodb.Table(this, "BenchmarkPricesTable", {
      tableName: "FinancialBenchmarkPrices",
      partitionKey: { name: "symbol", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "date", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const expenseTransactionsTable = new dynamodb.Table(this, "ExpenseTransactionsTable", {
      tableName: "FinancialExpenseTransactions",
      partitionKey: { name: "transactionId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      deletionProtection: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const expenseCategoriesTable = new dynamodb.Table(this, "ExpenseCategoriesTable", {
      tableName: "FinancialExpenseCategories",
      partitionKey: { name: "categoryId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      deletionProtection: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const tables = [
      plaidItemsTable,
      viewsTable,
      categoriesTable,
      assignmentsTable,
      holdingsCurrentTable,
      portfolioHistoryTable,
      netWorthTable,
      manualHoldingsTable,
      contributionsTable,
      benchmarkPricesTable,
      expenseTransactionsTable,
      expenseCategoriesTable,
    ];

    const dlq = new sqs.Queue(this, "SyncDeadLetterQueue", {
      queueName: "FinancialManagementSyncDLQ",
      retentionPeriod: cdk.Duration.days(14),
    });

    const syncFunction = new nodejs.NodejsFunction(this, "SyncFunction", {
      functionName: "financial-management-sync",
      entry: path.join(__dirname, "../lambda/sync-handler.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.minutes(2),
      memorySize: 512,
      projectRoot: REPO_ROOT,
      depsLockFilePath: path.join(REPO_ROOT, "package-lock.json"),
      bundling: { externalModules: [] },
      environment: {
        FINANCIAL_MANAGEMENT_PLAID_ITEMS_TABLE: plaidItemsTable.tableName,
        FINANCIAL_MANAGEMENT_VIEWS_TABLE: viewsTable.tableName,
        FINANCIAL_MANAGEMENT_CATEGORIES_TABLE: categoriesTable.tableName,
        FINANCIAL_MANAGEMENT_ASSIGNMENTS_TABLE: assignmentsTable.tableName,
        FINANCIAL_MANAGEMENT_HOLDINGS_CURRENT_TABLE: holdingsCurrentTable.tableName,
        FINANCIAL_MANAGEMENT_PORTFOLIO_HISTORY_TABLE: portfolioHistoryTable.tableName,
        FINANCIAL_MANAGEMENT_NET_WORTH_TABLE: netWorthTable.tableName,
        FINANCIAL_MANAGEMENT_MANUAL_HOLDINGS_TABLE: manualHoldingsTable.tableName,
        FINANCIAL_MANAGEMENT_CONTRIBUTIONS_TABLE: contributionsTable.tableName,
        FINANCIAL_MANAGEMENT_BENCHMARK_PRICES_TABLE: benchmarkPricesTable.tableName,
        FINANCIAL_MANAGEMENT_EXPENSE_TRANSACTIONS_TABLE: expenseTransactionsTable.tableName,
        FINANCIAL_MANAGEMENT_EXPENSE_CATEGORIES_TABLE: expenseCategoriesTable.tableName,
        PLAID_CLIENT_ID: requiredEnv("PLAID_CLIENT_ID"),
        PLAID_SECRET: requiredEnv("PLAID_SECRET"),
        PLAID_ENV: process.env.PLAID_ENV || "production",
      },
    });

    for (const table of tables) table.grantReadWriteData(syncFunction);
    plaidItemsKey.grantEncryptDecrypt(syncFunction);

    // EventBridge Scheduler (not a plain cron Rule) for its native retry
    // policy + DLQ — "retry until it succeeds" needs that, a Rule doesn't
    // have it. Saturday 3pm Pacific leaves a wide margin for Friday's close,
    // which reaches Plaid overnight, and is still Saturday in UTC, which dates
    // the rows. That run records History/Net Worth; every run refreshes
    // holdings and syncs expenses.
    const schedulerRole = new iam.Role(this, "SchedulerRole", {
      roleName: "financial-management-scheduler",
      assumedBy: new iam.ServicePrincipal("scheduler.amazonaws.com"),
    });
    syncFunction.grantInvoke(schedulerRole);

    const schedules = [
      { id: "WeeklySyncSchedule", name: "financial-management-weekly-sync", cron: "cron(0 15 ? * SAT *)", timezone: "America/Los_Angeles", mode: "weekly" },
      // That day's market closes; seen in Plaid by 8:40pm Pacific.
      { id: "EveningHoldingsSchedule", name: "financial-management-evening-holdings", cron: "cron(0 21 ? * MON-FRI *)", timezone: "America/Los_Angeles", mode: "daily" },
    ];
    for (const s of schedules) {
      new scheduler.CfnSchedule(this, s.id, {
        name: s.name,
        scheduleExpression: s.cron,
        scheduleExpressionTimezone: s.timezone,
        flexibleTimeWindow: { mode: "OFF" },
        target: {
          arn: syncFunction.functionArn,
          roleArn: schedulerRole.roleArn,
          input: JSON.stringify({ mode: s.mode }),
          retryPolicy: { maximumRetryAttempts: 10, maximumEventAgeInSeconds: 86400 },
          deadLetterConfig: { arn: dlq.queueArn },
        },
      });
    }
    dlq.grantSendMessages(schedulerRole);

    // Scoped-down IAM user for the Next.js app (running on Vercel). It runs
    // the same integrator code as the Lambda (post-link, webhook, and
    // expense syncs), so it needs the same table/KMS access — no console access, no
    // other AWS permissions.
    const appUser = new iam.User(this, "AppUser", {
      userName: "financial-management-app",
    });
    for (const table of tables) table.grantReadWriteData(appUser);
    plaidItemsKey.grantEncryptDecrypt(appUser);

    // CDK would otherwise generate these names with a random suffix.
    (syncFunction.role!.node.defaultChild as iam.CfnRole).roleName = "financial-management-sync";
    const namePolicy = (grantee: Construct, policyName: string) => {
      (grantee.node.findChild("DefaultPolicy").node.defaultChild as iam.CfnPolicy).policyName = policyName;
    };
    namePolicy(syncFunction.role!, "financial-management-sync");
    namePolicy(schedulerRole, "financial-management-scheduler");
    namePolicy(appUser, "financial-management-app");

    new cdk.CfnOutput(this, "AppUserName", { value: appUser.userName });
    new cdk.CfnOutput(this, "SyncFunctionName", { value: syncFunction.functionName });
    new cdk.CfnOutput(this, "Region", { value: this.region });
  }
}
