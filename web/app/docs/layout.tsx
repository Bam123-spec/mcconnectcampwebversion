import { DocsSidebar, MobileDocsNav } from "@/components/docs/sidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation | Raptor Connect",
  description: "Learn how to navigate and manage Raptor Connect.",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex max-w-[90rem] flex-col px-4 sm:px-6 md:flex-row lg:px-8">
        <DocsSidebar />
        <main className="w-full max-w-4xl flex-1 py-8 md:px-12 md:py-10">
          <MobileDocsNav />
          {children}
        </main>
      </div>
    </div>
  );
}
