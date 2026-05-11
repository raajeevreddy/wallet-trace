import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Explain My Wallet",
  description: "Institutional-grade AI analysis for any crypto wallet",
  openGraph: {
    title: "Explain My Wallet",
    description: "Turn blockchain data into plain English intelligence",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
