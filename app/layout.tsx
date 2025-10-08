import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { UserProvider } from "@/providers/user-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coworking - AI-Powered Workspace Search",
  description: "Find and book coworking spaces in Montreal with AI. Natural language search, smart recommendations, and instant booking.",
  keywords: ["coworking", "montreal", "ai", "workspace", "booking", "office space"],
  // authors: [{ name: "Vadim Driha" }],
  openGraph: {
    title: "Coworking - AI-Powered Search",
    description: "Chat with AI to discover and book coworking spaces in Montreal",
    type: "website",
    locale: "en_US",
    siteName: "Coworking",
  },
  twitter: {
    card: "summary_large_image",
    title: "Coworking - AI-Powered Search",
    description: "Find coworking spaces with AI conversation",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          {children}
          <Toaster />
        </UserProvider>
      </body>
    </html>
  );
}
