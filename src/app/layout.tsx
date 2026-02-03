import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Text } from "next/font/google";
import { Toaster } from "sonner";
import { Header } from "@/components/header";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Text({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Travel Itinerary",
  description: "Plan and organize your trips",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${dmSerif.variable} antialiased`}
      >
        <Header />
        <main className="container mx-auto px-4 py-8">{children}</main>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
