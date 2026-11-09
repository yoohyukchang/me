#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { FinancialManagementStack } from "../lib/financial-management-stack";

const app = new cdk.App();

new FinancialManagementStack(app, "FinancialManagementStack", {
  env: {
    account: "149536467459",
    region: "us-west-2",
  },
});
