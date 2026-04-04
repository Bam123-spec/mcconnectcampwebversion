import { DocsSidebar } from "@/components/docs/sidebar";
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
    <div className="bg-white min-h-screen">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row">
        <DocsSidebar />
        <main className="flex-1 py-10 md:px-12 w-full max-w-4xl">
          {children}
        </main>
      </div>
    </div>
  );
}
