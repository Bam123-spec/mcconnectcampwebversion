import { createContext, useContext, type ReactNode } from "react";
import { Session } from "@supabase/supabase-js";

export type AuthContextValue = {
  session: Session | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  loading: true,
});

export function AuthProvider({ children, value }: { children: ReactNode; value: AuthContextValue }) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
