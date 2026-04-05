import type { Metadata } from "next";
import { ProfileOverview } from "@/components/profile/profile-overview";

export const metadata: Metadata = {
  title: "My Profile | Raptor Connect",
  description: "View your Montgomery College profile, memberships, and saved campus activity.",
};

export default function ProfilePage() {
  return <ProfileOverview />;
}
