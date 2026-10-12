import type { Metadata } from "next";
import { Montserrat, Source_Sans_3 } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

const heading = Montserrat({ subsets: ["latin"], variable: "--font-heading", display: "swap" });
const body = Source_Sans_3({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: "ELS · Employee Leave Management",
  description: "Request, track and approve employee leave in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
