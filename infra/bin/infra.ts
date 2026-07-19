#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { FinancialHoldingsStack } from "../lib/financial-holdings-stack";

const app = new cdk.App();

new FinancialHoldingsStack(app, "FinancialHoldingsStack", {
  env: {
    account: "149536467459",
    region: "us-west-2",
  },
});
