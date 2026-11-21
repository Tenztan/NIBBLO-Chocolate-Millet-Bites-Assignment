import { Bricolage_Grotesque, DM_Mono } from "next/font/google";
import "./globals.css";

// Display + body: a chunky, warm grotesque that sits well next to the rounded NIBBLŌ wordmark on the pack.
const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"], display: "swap" });
// Small labels, prices, nutrition numbers.
const mono = DM_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500"], display: "swap" });

const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;

export const metadata = {
  metadataBase: new URL(host ? `https://${host}` : "http://localhost:3009"),
  title: "NIBBLŌ — Chocolate Millet Bites",
  description: "Crunchy millet bites coated in rich chocolate. High fibre, no maida, baked not fried. The smarter snack.",
  openGraph: {
    title: "NIBBLŌ — Chocolate Millet Bites",
    description: "Crunchy millet bites coated in rich chocolate. The smarter snack.",
    images: ["/pack/front.webp"],
  },
};

export const viewport = { themeColor: "#2b140b" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
