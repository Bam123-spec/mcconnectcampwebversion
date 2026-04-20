import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import {
  createAuthenticatedServerSupabaseClient,
  createServerSupabaseClient,
} from "@/lib/supabase";

export const ACCESS_TOKEN_COOKIE = "rc-access-token";
export const REFRESH_TOKEN_COOKIE = "rc-refresh-token";

export type WebSessionProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  org_id: string | null;
};

const SESSION_PROFILE_SELECT = "id,full_name,email,role,org_id";

export async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || null;
}

export async function getCurrentUser(): Promise<User | null> {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  const client = createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser(accessToken);

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getAuthenticatedClient() {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  const user = await getCurrentUser();
  if (!user) return null;

  return {
    accessToken,
    user,
    client: createAuthenticatedServerSupabaseClient(accessToken),
  };
}

export async function getCurrentProfile(): Promise<WebSessionProfile | null> {
  const session = await getAuthenticatedClient();
  if (!session) return null;

  const { data, error } = await session.client
    .from("profiles")
    .select(SESSION_PROFILE_SELECT)
    .eq("id", session.user.id)
    .maybeSingle();

  if (error) {
    console.error("Error loading web session profile:", error);
    return {
      id: session.user.id,
      full_name: session.user.email ?? null,
      email: session.user.email ?? null,
      role: null,
      org_id: null,
    };
  }

  return (data as WebSessionProfile | null) ?? {
    id: session.user.id,
    full_name: session.user.email ?? null,
    email: session.user.email ?? null,
    role: null,
    org_id: null,
  };
}
