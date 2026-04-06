import type { Metadata } from "next";
import { ActivityPanel } from "@/components/activity/activity-panel";

export const metadata: Metadata = {
  title: "My Dashboard | Raptor Connect",
  description: "View your profile summary, club memberships, RSVPs, saved events, and campus involvement in one place.",
};

export default function ActivityPage() {
  return <ActivityPanel />;
}
