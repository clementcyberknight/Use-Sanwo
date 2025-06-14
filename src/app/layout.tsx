import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./provider";

const myFont = localFont({ src: "./fonts/Aeonik.otf" });

export const metadata = {
  title: "sanwo",
  description:
    "Sanwo - Financial management platform for web3 business with StableCoin(USDC) and AI agent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="Sanwó" content="Sanwó" />
      </head>
      <body className={myFont.className}>
        {/* Now Providers is a client component, so no serialization errors */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
