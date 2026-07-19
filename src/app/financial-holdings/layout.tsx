import type { Metadata } from "next";
import { ToastProvider } from "@/components/financial-holdings/toast";

export const metadata: Metadata = {
  title: "Financial Holdings",
  robots: {
    index: false,
    follow: false,
  },
};

export default function FinancialHoldingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToastProvider>{children}</ToastProvider>;
}
