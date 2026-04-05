export type OfficerCapability =
  | "viewAnalytics"
  | "manageMembers"
  | "manageRoles"
  | "createEvents"
  | "postAnnouncements"
  | "scanTickets"
  | "viewInbox";

type NormalizedOfficerRole =
  | "admin"
  | "president"
  | "vice_president"
  | "treasurer"
  | "secretary"
  | "officer"
  | "member";

const CAPABILITIES: Record<NormalizedOfficerRole, OfficerCapability[]> = {
  admin: [
    "viewAnalytics",
    "manageMembers",
    "manageRoles",
    "createEvents",
    "postAnnouncements",
    "scanTickets",
    "viewInbox",
  ],
  president: [
    "viewAnalytics",
    "manageMembers",
    "manageRoles",
    "createEvents",
    "postAnnouncements",
    "scanTickets",
    "viewInbox",
  ],
  vice_president: [
    "viewAnalytics",
    "manageMembers",
    "createEvents",
    "postAnnouncements",
    "scanTickets",
    "viewInbox",
  ],
  treasurer: ["viewAnalytics", "createEvents", "postAnnouncements", "viewInbox"],
  secretary: ["viewAnalytics", "postAnnouncements", "scanTickets", "viewInbox"],
  officer: ["viewInbox", "postAnnouncements"],
  member: [],
};

export function normalizeOfficerRole(role?: string | null): NormalizedOfficerRole {
  const value = role?.trim().toLowerCase() || "";

  if (value.includes("admin")) return "admin";
  if (value.includes("president") && !value.includes("vice") && !value.includes("v. ")) return "president";
  if (
    value.includes("vice president") ||
    value.includes("v. president") ||
    value === "vp" ||
    value.includes("vice_president")
  ) {
    return "vice_president";
  }
  if (value.includes("treasurer")) return "treasurer";
  if (value.includes("secretary")) return "secretary";
  if (value.includes("officer")) return "officer";
  return "member";
}

export function hasOfficerCapability(role: string | null | undefined, capability: OfficerCapability) {
  return CAPABILITIES[normalizeOfficerRole(role)].includes(capability);
}
