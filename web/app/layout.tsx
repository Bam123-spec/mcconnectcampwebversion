import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Raptor Connect | Montgomery College Campus Life",
  description: "The official campus dashboard for Montgomery College students and staff.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("auth")?.value === "true";

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <div className="flex flex-col min-h-screen">
          <TopNav isAuthenticated={isAuthenticated} />
          <main className="flex-1 w-full bg-white relative">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
