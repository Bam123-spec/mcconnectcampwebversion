import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { OfficerCapability, hasOfficerCapability } from "@/lib/officerPermissions";
import { useOfficerStatus } from "@/hooks/useOfficerStatus";

type UseOfficerAccessOptions = {
  clubId?: string;
  requiredCapabilities?: OfficerCapability[];
};

export function useOfficerAccess(options: UseOfficerAccessOptions = {}) {
  const { clubId, requiredCapabilities = [] } = options;
  const { officerClubs, loading: officerLoading, checkOfficerStatus } = useOfficerStatus();
  const [profileRole, setProfileRole] = useState<string>("student");
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadProfileRole = async () => {
      setProfileLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (!cancelled) {
            setProfileRole("student");
          }
          return;
        }

        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (!cancelled) {
          setProfileRole(data?.role || "student");
        }
      } catch (error) {
        console.error("Error loading officer access profile role:", error);
        if (!cancelled) {
          setProfileRole("student");
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    };

    loadProfileRole();

    return () => {
      cancelled = true;
    };
  }, []);

  const currentClub = useMemo(() => {
    if (!clubId) {
      return officerClubs[0] || null;
    }

    return officerClubs.find((club) => club.club_id === clubId) || null;
  }, [clubId, officerClubs]);

  const isGlobalAdmin = profileRole === "admin";
  const effectiveRole = isGlobalAdmin ? "admin" : currentClub?.role || "member";
  const hasClubContext = !!currentClub;
  const canAccess =
    hasClubContext &&
    requiredCapabilities.every((capability) => hasOfficerCapability(effectiveRole, capability));

  const deniedReason = !hasClubContext
    ? "You are not assigned to this club’s leadership workspace."
    : "Your current leadership role does not have permission to use this screen.";

  return {
    loading: officerLoading || profileLoading,
    currentClub,
    officerClubs,
    profileRole,
    effectiveRole,
    isGlobalAdmin,
    canAccess,
    deniedReason,
    checkOfficerStatus,
  };
}
