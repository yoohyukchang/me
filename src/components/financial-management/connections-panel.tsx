"use client";

import { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { apiRequest } from "@/lib/financial-management/client";
import { formatRelativeTime } from "@/lib/financial-management/format";
import type { ItemProduct, PublicPlaidItem } from "@/lib/financial-management/types";
import { AlertIcon, CheckIcon, SpinnerIcon } from "./icons";
import { useToast } from "./toast";

function ConnectButton({
  label,
  product,
  updateItemId,
  onDone,
}: {
  label: string;
  product: ItemProduct;
  updateItemId?: string;
  onDone: () => void;
}) {
  const showToast = useToast();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken) => {
      try {
        if (updateItemId) {
          await apiRequest("/api/financial-management/plaid/resync", { method: "POST" });
        } else {
          await apiRequest("/api/financial-management/plaid/exchange", {
            method: "POST",
            body: JSON.stringify({ publicToken, product }),
          });
        }
        onDone();
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Failed to finish connecting", "error");
      } finally {
        setLinkToken(null);
      }
    },
    onExit: () => setLinkToken(null),
  });

  useEffect(() => {
    if (linkToken && ready) open();
  }, [linkToken, ready, open]);

  async function handleClick() {
    setLoading(true);
    try {
      const data = await apiRequest("/api/financial-management/plaid/link-token", {
        method: "POST",
        body: JSON.stringify(updateItemId ? { mode: "update", itemId: updateItemId } : { product }),
      });
      setLinkToken(data.linkToken);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to start Plaid Link", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs font-medium text-accent hover:opacity-80 transition-opacity disabled:opacity-50"
    >
      {loading && <SpinnerIcon />}
      {label}
    </button>
  );
}

function DisconnectButton({ itemId, onDone }: { itemId: string; onDone: () => void }) {
  const showToast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await apiRequest(`/api/financial-management/plaid/items/${itemId}`, { method: "DELETE" });
      onDone();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to disconnect", "error");
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-2 text-xs">
        <span className="text-gray-500">Remove this connection?</span>
        <button type="button" onClick={handleConfirm} disabled={loading} className="font-medium text-red-600 hover:opacity-80">
          {loading ? "Removing…" : "Yes"}
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="text-gray-400 hover:text-gray-600">
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-xs text-gray-300 hover:text-red-600 transition-colors"
    >
      Disconnect
    </button>
  );
}

export default function ConnectionsPanel({
  items,
  onChanged,
}: {
  items: PublicPlaidItem[];
  onChanged: () => void;
}) {
  return (
    <div className="text-sm">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Connected accounts
      </h3>
      {items.length === 0 ? (
        <p className="mb-3 text-sm text-gray-400">Nothing connected yet.</p>
      ) : (
        <ul className="mb-3 space-y-3">
          {items.map((item) => (
            <li key={item.itemId}>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 min-w-0">
                  {item.status === "active" ? (
                    <CheckIcon className="shrink-0 text-emerald-600" />
                  ) : (
                    <AlertIcon className="shrink-0 text-amber-600" />
                  )}
                  <span className="truncate text-gray-700">{item.institutionName}</span>
                </span>
                {item.status === "active" ? (
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-gray-400">
                      synced {formatRelativeTime(item.lastSyncedAt)}
                    </span>
                    <ConnectButton
                      label="Add account"
                      product={item.product}
                      updateItemId={item.itemId}
                      onDone={onChanged}
                    />
                  </span>
                ) : (
                  <ConnectButton
                    label="Reconnect"
                    product={item.product}
                    updateItemId={item.itemId}
                    onDone={onChanged}
                  />
                )}
              </div>
              <div className="mt-1 flex justify-end">
                <DisconnectButton itemId={item.itemId} onDone={onChanged} />
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-col gap-1.5 border-t border-gray-100 pt-3">
        <ConnectButton label="+ Connect a bank" product="transactions" onDone={onChanged} />
        <ConnectButton label="+ Connect Fidelity" product="investments" onDone={onChanged} />
      </div>
    </div>
  );
}
