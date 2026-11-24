import type { BankChanges, BankTransaction } from "../../expenses";
import type { TransactionsProvider } from "../types";
import { plaidClient } from "./client";

const MAX_PAGINATION_RETRIES = 3;

export const plaidTransactionsProvider: TransactionsProvider = {
  async fetchChanges(accessToken, cursor) {
    for (let attempt = 1; ; attempt++) {
      try {
        return await fetchAllPages(accessToken, cursor);
      } catch (error) {
        // Plaid's data changed mid-pagination: restart from the original cursor, as its docs require.
        const message = error instanceof Error ? error.message : "";
        if (attempt >= MAX_PAGINATION_RETRIES || !message.includes("TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION")) {
          throw error;
        }
      }
    }
  },

  async fetchAccounts(accessToken) {
    const response = await plaidClient.accounts.get({ access_token: accessToken });
    return response.accounts.map((a) => ({
      accountId: a.account_id,
      name: a.name,
      mask: a.mask,
      type: a.type,
      subtype: a.subtype,
    }));
  },
};

async function fetchAllPages(accessToken: string, startCursor: string | null) {
  const changes: BankChanges = { added: [], modified: [], removed: [] };
  let cursor = startCursor ?? undefined;
  let hasMore = true;
  while (hasMore) {
    const page = await plaidClient.transactions.sync({ access_token: accessToken, cursor, count: 500 });
    changes.added.push(...page.added.map(toBankTransaction));
    changes.modified.push(...page.modified.map(toBankTransaction));
    changes.removed.push(...page.removed.map((r) => r.transaction_id));
    cursor = page.next_cursor;
    hasMore = page.has_more;
  }
  return { changes, nextCursor: cursor ?? "" };
}

function toBankTransaction(txn: {
  transaction_id: string;
  pending_transaction_id: string | null;
  account_id: string;
  amount: number;
  merchant_name?: string | null;
  name: string;
  authorized_date: string | null;
  date: string;
  pending: boolean;
  personal_finance_category?: { detailed: string } | null;
}): BankTransaction {
  return {
    transactionId: txn.transaction_id,
    pendingTransactionId: txn.pending_transaction_id,
    accountId: txn.account_id,
    amount: txn.amount,
    merchant: txn.merchant_name ?? txn.name,
    date: txn.authorized_date ?? txn.date,
    pending: txn.pending,
    categoryDetailed: txn.personal_finance_category?.detailed ?? null,
  };
}
