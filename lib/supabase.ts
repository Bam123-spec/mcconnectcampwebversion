import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { secureStorage } from "./storage";
import { appConfig } from "./appConfig";

export const supabase = createClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey, {
  auth: {
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
