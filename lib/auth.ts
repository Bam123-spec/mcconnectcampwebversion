import { supabase } from "./supabase";
import { appConfig, isEmailDomainAllowed } from "./appConfig";

export async function signIn(email: string, password: string) {
  if (!isEmailDomainAllowed(email)) {
    throw new Error("This email domain is not allowed for this deployment.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string) {
  if (!appConfig.allowSelfSignup) {
    throw new Error("Self-service signup is disabled for this deployment.");
  }

  if (!isEmailDomainAllowed(email)) {
    throw new Error("This email domain is not allowed for self-service signup.");
  }

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
