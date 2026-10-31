import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Manish. — Creator Curated Finds",
    template: "%s | Manish.",
  },
  description:
    "Grooming, fashion, fitness and everyday finds from my Instagram, with a direct link to buy each one.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  display: "swap",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  display: "swap",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bricolage.variable} ${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
