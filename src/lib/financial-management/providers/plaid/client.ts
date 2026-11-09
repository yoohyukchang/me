import { PlaidClient, PlaidEnvironment } from "plaid";

function resolveEnvironment(): string {
  const env = (process.env.PLAID_ENV || "sandbox").toLowerCase();
  if (env === "production") return PlaidEnvironment.Production;
  if (env === "sandbox") return PlaidEnvironment.Sandbox;
  throw new Error(`Unknown PLAID_ENV "${env}"`);
}

export const plaidClient = new PlaidClient({
  environment: resolveEnvironment(),
  clientId: process.env.PLAID_CLIENT_ID,
  secret: process.env.PLAID_SECRET,
});
