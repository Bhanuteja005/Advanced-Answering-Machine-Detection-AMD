import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import AppHeader from "@/components/AppHeader";
import { QueryProvider } from "@/components/QueryProvider";
import { Toaster } from "sonner";
import { aeonik } from "@/utils/constants/fonts";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AMD - Answering Machine Detection",
  description: "Advanced answering machine detection with Twilio and AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scrollbar">
      <body
        className={`${aeonik.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased font-sans overflow-x-hidden`}
      >
        <QueryProvider>
          <AppHeader />
          {children}
          <Toaster richColors closeButton position="top-right" theme="dark" />
        </QueryProvider>
      </body>
    </html>
  );
}
