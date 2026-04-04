import { supabase } from "@/lib/supabase";
import { Profile } from "@/types/database";

export type SessionProfile = Pick<Profile, "id" | "full_name" | "email" | "role" | "org_id">;

const SESSION_PROFILE_SELECT = "id, full_name, email, role, org_id";

export const getSessionProfile = async (): Promise<SessionProfile | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(SESSION_PROFILE_SELECT)
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error loading session profile:", error);
    return null;
  }

  return data;
};

export const hasTenantMembership = (profile: SessionProfile | null) => {
  return !!profile?.org_id;
};

