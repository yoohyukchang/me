import { Plaid } from "plaid";
import { plaidClient } from "./client";

const CLIENT_NAME = "Yoohyuk's Financial Management";
const USER_ID = "yoohyuk"; // single-user app; stable id required by link_token/create

export async function createLinkToken(options: {
  product: "investments" | "transactions";
  webhookUrl: string;
  updateAccessToken?: string;
}) {
  const response = await plaidClient.link.createToken({
    client_name: CLIENT_NAME,
    language: "en",
    country_codes: [Plaid.CountryCode.Us],
    user: { client_user_id: USER_ID },
    webhook: options.webhookUrl,
    ...(options.updateAccessToken
      ? { access_token: options.updateAccessToken }
      : {
          products: [
            options.product === "investments"
              ? Plaid.Products.Investments
              : Plaid.Products.Transactions,
          ],
        }),
  });
  return response.link_token;
}

export async function exchangePublicToken(publicToken: string) {
  const response = await plaidClient.item.exchangePublicToken({ public_token: publicToken });
  return { accessToken: response.access_token, itemId: response.item_id };
}

export async function getInstitution(accessToken: string) {
  const item = await plaidClient.item.get({ access_token: accessToken });
  return {
    institutionId: item.item.institution_id ?? "unknown",
    institutionName: item.item.institution_name ?? "Unknown institution",
  };
}

export async function removeItem(accessToken: string): Promise<void> {
  await plaidClient.item.remove({ access_token: accessToken });
}
