import type { Metadata, Viewport } from "next";
import { Epilogue, Fraunces } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});
const bodyFont = Epilogue({ subsets: ["latin"], variable: "--font-epilogue" });

export const metadata: Metadata = {
  title: { default: "Hannah & Isaac", template: "%s | Hannah & Isaac" },
  description: "Wedding information for the guests of Hannah and Isaac.",
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        {children}
      </body>
    </html>
  );
}
