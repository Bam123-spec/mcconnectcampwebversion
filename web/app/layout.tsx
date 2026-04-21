import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { getCurrentProfile } from "@/lib/auth-session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Raptor Connect | Montgomery College Campus Life",
  description: "The official campus dashboard for Montgomery College students and staff.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCurrentProfile();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <div className="flex flex-col min-h-screen">
          <TopNav profile={profile} />
          <main className="relative flex-1 w-full bg-[var(--page-background)]">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
