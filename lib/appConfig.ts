const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value == null) return fallback;
  return value === "true";
};

const parseList = (value: string | undefined) =>
  (value || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

export const appConfig = {
  supabaseUrl:
    process.env.EXPO_PUBLIC_SUPABASE_URL || "https://ahvivjsmhbwbjthtiudt.supabase.co",
  supabaseAnonKey:
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodml2anNtaGJ3Ymp0aHRpdWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MzY5NjAsImV4cCI6MjA3NzAxMjk2MH0.ptniNhKLjj0DZ1zPYq7cXTtY9fBHBIvi4Kkzmy7ZC5E",
  allowSelfSignup: parseBoolean(process.env.EXPO_PUBLIC_ALLOW_SELF_SIGNUP, __DEV__),
  requireTenantMembership: parseBoolean(process.env.EXPO_PUBLIC_REQUIRE_TENANT_MEMBERSHIP, false),
  allowedEmailDomains: parseList(process.env.EXPO_PUBLIC_ALLOWED_EMAIL_DOMAINS),
  supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL || "support@raptorconnect.app",
};

export const getEmailDomain = (email: string) =>
  email.trim().toLowerCase().split("@")[1] || "";

export const isEmailDomainAllowed = (email: string) => {
  if (appConfig.allowedEmailDomains.length === 0) {
    return true;
  }

  return appConfig.allowedEmailDomains.includes(getEmailDomain(email));
};

