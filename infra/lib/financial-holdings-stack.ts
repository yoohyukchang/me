import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";

export class FinancialHoldingsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const categoriesTable = new dynamodb.Table(this, "CategoriesTable", {
      tableName: "FinancialHoldingsCategories",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const stocksTable = new dynamodb.Table(this, "StocksTable", {
      tableName: "FinancialHoldingsStocks",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const historyTable = new dynamodb.Table(this, "HistoryTable", {
      tableName: "FinancialHoldingsHistory",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const budgetCategoriesTable = new dynamodb.Table(this, "BudgetCategoriesTable", {
      tableName: "FinancialHoldingsBudgetCategories",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // id = "YYYY-MM" (zero-padded), one item per calendar month, so saves
    // are a plain idempotent PutItem keyed by the month itself.
    const budgetMonthsTable = new dynamodb.Table(this, "BudgetMonthsTable", {
      tableName: "FinancialHoldingsBudgetMonths",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Scoped-down IAM user for the Next.js app (running on Vercel) to
    // read/write only these two tables. No console access, no other
    // AWS permissions.
    const appUser = new iam.User(this, "AppUser", {
      userName: "financial-holdings-app",
    });

    const tableAccessPolicy = new iam.Policy(this, "TableAccessPolicy", {
      policyName: "FinancialHoldingsTableAccess",
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "dynamodb:GetItem",
            "dynamodb:PutItem",
            "dynamodb:UpdateItem",
            "dynamodb:DeleteItem",
            "dynamodb:Query",
            "dynamodb:Scan",
          ],
          resources: [
            categoriesTable.tableArn,
            stocksTable.tableArn,
            historyTable.tableArn,
            budgetCategoriesTable.tableArn,
            budgetMonthsTable.tableArn,
          ],
        }),
      ],
    });

    appUser.attachInlinePolicy(tableAccessPolicy);

    new cdk.CfnOutput(this, "CategoriesTableName", {
      value: categoriesTable.tableName,
    });
    new cdk.CfnOutput(this, "StocksTableName", {
      value: stocksTable.tableName,
    });
    new cdk.CfnOutput(this, "HistoryTableName", {
      value: historyTable.tableName,
    });
    new cdk.CfnOutput(this, "BudgetCategoriesTableName", {
      value: budgetCategoriesTable.tableName,
    });
    new cdk.CfnOutput(this, "BudgetMonthsTableName", {
      value: budgetMonthsTable.tableName,
    });
    new cdk.CfnOutput(this, "AppUserName", {
      value: appUser.userName,
    });
    new cdk.CfnOutput(this, "Region", {
      value: this.region,
    });
  }
}
