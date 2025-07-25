import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/home-page-components/navbar/nav-bar";
import Footer from "@/components/home-page-components/footer/footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yoohyuk Chang",
  description: "Personal website for myself",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-white">
          <Navbar />
            {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}