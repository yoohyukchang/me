import crypto from "crypto";
import { plaidClient } from "./client";

const keyCache = new Map<string, { key: crypto.KeyObject; expiresAt: number }>();
const MAX_CLOCK_SKEW_SECONDS = 5 * 60;

function base64UrlDecode(input: string): Buffer {
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

async function getVerificationKey(keyId: string): Promise<crypto.KeyObject> {
  const cached = keyCache.get(keyId);
  if (cached && cached.expiresAt > Date.now()) return cached.key;

  const response = await plaidClient.webhook.getVerificationKey({ key_id: keyId });
  const jwk = response.key;
  if (jwk.expired_at !== null) throw new Error("Webhook verification key has expired");

  const key = crypto.createPublicKey({
    key: { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y },
    format: "jwk",
  });
  keyCache.set(keyId, { key, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
  return key;
}

/**
 * Verifies the `Plaid-Verification` JWT against the raw request body, per
 * https://plaid.com/docs/api/webhooks/webhook-verification/ — checks the
 * ES256 signature, a 5-minute freshness window, and the body hash claim.
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): Promise<boolean> {
  if (!signatureHeader) return false;
  const [headerB64, payloadB64, signatureB64] = signatureHeader.split(".");
  if (!headerB64 || !payloadB64 || !signatureB64) return false;

  let header: { alg?: string; kid?: string };
  let payload: { iat?: number; request_body_sha256?: string };
  try {
    header = JSON.parse(base64UrlDecode(headerB64).toString("utf8"));
    payload = JSON.parse(base64UrlDecode(payloadB64).toString("utf8"));
  } catch {
    return false;
  }
  if (header.alg !== "ES256" || !header.kid) return false;
  if (
    typeof payload.iat !== "number" ||
    Math.abs(Date.now() / 1000 - payload.iat) > MAX_CLOCK_SKEW_SECONDS
  ) {
    return false;
  }

  const key = await getVerificationKey(header.kid);
  const verified = crypto.verify(
    "sha256",
    Buffer.from(`${headerB64}.${payloadB64}`),
    { key, dsaEncoding: "ieee-p1363" },
    base64UrlDecode(signatureB64)
  );
  if (!verified) return false;

  const bodyHash = crypto.createHash("sha256").update(rawBody, "utf8").digest("hex");
  return bodyHash === payload.request_body_sha256;
}

export type ItemWebhookOutcome =
  | { kind: "login_required"; itemId: string }
  | { kind: "repaired"; itemId: string }
  | { kind: "data_ready"; itemId: string }
  | { kind: "ignored" };

/**
 * Classifies the subset of Plaid webhooks this app reacts to.
 *
 * "data_ready" matters more than it looks: a brand-new Fidelity Item's
 * holdings snapshot can lag its investment-transactions feed by minutes
 * (confirmed against real data — /investments/holdings/get returned empty
 * right after linking even though /investments/transactions/get already
 * had 148 real transactions). Resyncing on HOLDINGS/INVESTMENTS_TRANSACTIONS
 * update webhooks means that gap closes itself instead of sitting empty
 * until the next scheduled Saturday run.
 */
export function classifyItemWebhook(body: Record<string, unknown>): ItemWebhookOutcome {
  const webhookType = body.webhook_type;
  const webhookCode = body.webhook_code;
  const itemId = body.item_id;
  if (typeof itemId !== "string") return { kind: "ignored" };

  if (webhookType === "ITEM") {
    if (webhookCode === "ERROR") {
      const errorCode = (body.error as { error_code?: string } | undefined)?.error_code;
      if (errorCode === "ITEM_LOGIN_REQUIRED") return { kind: "login_required", itemId };
    }
    if (webhookCode === "PENDING_DISCONNECT" || webhookCode === "PENDING_EXPIRATION") {
      return { kind: "login_required", itemId };
    }
    if (webhookCode === "LOGIN_REPAIRED") return { kind: "repaired", itemId };
  }

  if (webhookType === "HOLDINGS" || webhookType === "INVESTMENTS_TRANSACTIONS") {
    if (webhookCode === "DEFAULT_UPDATE" || webhookCode === "HISTORICAL_UPDATE") {
      return { kind: "data_ready", itemId };
    }
  }

  return { kind: "ignored" };
}
