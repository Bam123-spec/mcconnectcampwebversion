import type { Metadata } from "next";
import { ActivityPanel } from "@/components/activity/activity-panel";

export const metadata: Metadata = {
  title: "My Activity | Raptor Connect",
  description: "View your profile, club memberships, RSVPs, saved events, and campus involvement in one place.",
};

export default function ActivityPage() {
  return <ActivityPanel />;
}
