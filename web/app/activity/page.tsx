import type { Metadata } from "next";
import { ActivityPanel } from "@/components/activity/activity-panel";

export const metadata: Metadata = {
  title: "My Activity | Raptor Connect",
  description: "Manage your club memberships, RSVPs, and campus involvement.",
};

export default function ActivityPage() {
  return <ActivityPanel />;
}
