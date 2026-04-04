export type OfficerCapability =
  | "viewAnalytics"
  | "manageMembers"
  | "manageRoles"
  | "createEvents"
  | "postAnnouncements"
  | "scanTickets"
  | "viewInbox";

export type NormalizedOfficerRole =
  | "admin"
  | "president"
  | "vice_president"
  | "treasurer"
  | "secretary"
  | "officer"
  | "member";

type RoleConfig = {
  label: string;
  shortLabel: string;
  rank: number;
  accent: string;
  tint: string;
  text: string;
  border: string;
  capabilities: OfficerCapability[];
};

const ROLE_CONFIG: Record<NormalizedOfficerRole, RoleConfig> = {
  admin: {
    label: "Admin",
    shortLabel: "Admin",
    rank: 6,
    accent: "#111827",
    tint: "bg-slate-100",
    text: "text-slate-800",
    border: "border-slate-300",
    capabilities: [
      "viewAnalytics",
      "manageMembers",
      "manageRoles",
      "createEvents",
      "postAnnouncements",
      "scanTickets",
      "viewInbox",
    ],
  },
  president: {
    label: "President",
    shortLabel: "Pres",
    rank: 5,
    accent: "#2563EB",
    tint: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    capabilities: [
      "viewAnalytics",
      "manageMembers",
      "manageRoles",
      "createEvents",
      "postAnnouncements",
      "scanTickets",
      "viewInbox",
    ],
  },
  vice_president: {
    label: "Vice President",
    shortLabel: "VP",
    rank: 4,
    accent: "#0EA5E9",
    tint: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    capabilities: [
      "viewAnalytics",
      "manageMembers",
      "createEvents",
      "postAnnouncements",
      "scanTickets",
      "viewInbox",
    ],
  },
  treasurer: {
    label: "Treasurer",
    shortLabel: "Treas",
    rank: 3,
    accent: "#059669",
    tint: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    capabilities: ["viewAnalytics", "createEvents", "postAnnouncements", "viewInbox"],
  },
  secretary: {
    label: "Secretary",
    shortLabel: "Sec",
    rank: 2,
    accent: "#D97706",
    tint: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    capabilities: ["viewAnalytics", "postAnnouncements", "scanTickets", "viewInbox"],
  },
  officer: {
    label: "Officer",
    shortLabel: "Officer",
    rank: 1,
    accent: "#7C3AED",
    tint: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    capabilities: ["viewInbox", "postAnnouncements"],
  },
  member: {
    label: "Member",
    shortLabel: "Member",
    rank: 0,
    accent: "#6B7280",
    tint: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
    capabilities: [],
  },
};

export const OFFICER_ASSIGNABLE_ROLES: NormalizedOfficerRole[] = [
  "vice_president",
  "treasurer",
  "secretary",
];

export function normalizeOfficerRole(role?: string | null): NormalizedOfficerRole {
  const value = role?.trim().toLowerCase() || "";

  if (value.includes("admin")) {
    return "admin";
  }

  if (value.includes("president") && !value.includes("vice") && !value.includes("v. ")) {
    return "president";
  }

  if (
    value.includes("vice president") ||
    value.includes("v. president") ||
    value === "vp" ||
    value.includes("vice_president")
  ) {
    return "vice_president";
  }

  if (value.includes("treasurer")) {
    return "treasurer";
  }

  if (value.includes("secretary")) {
    return "secretary";
  }

  if (value.includes("officer")) {
    return "officer";
  }

  return "member";
}

export function getOfficerRoleConfig(role?: string | null) {
  return ROLE_CONFIG[normalizeOfficerRole(role)];
}

export function getOfficerRoleLabel(role?: string | null) {
  return getOfficerRoleConfig(role).label;
}

export function getOfficerRoleRank(role?: string | null) {
  return getOfficerRoleConfig(role).rank;
}

export function hasOfficerCapability(role: string | null | undefined, capability: OfficerCapability) {
  return getOfficerRoleConfig(role).capabilities.includes(capability);
}

export function canManageOfficerRole(
  actingRole: string | null | undefined,
  targetRole: string | null | undefined
) {
  if (!hasOfficerCapability(actingRole, "manageRoles")) {
    return false;
  }

  return getOfficerRoleRank(actingRole) > getOfficerRoleRank(targetRole);
}
