import type { Metadata } from "next";
import { ToastProvider } from "@/components/financial-management/toast";

export const metadata: Metadata = {
  title: "Financial Management",
  robots: {
    index: false,
    follow: false,
  },
};

export default function FinancialManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToastProvider>{children}</ToastProvider>;
}
