import { isSupabaseConfigured } from "../supabase/config";

export type DataSourceMode = "mock" | "supabase";

export function getDataSourceMode(): DataSourceMode {
  return isSupabaseConfigured() ? "supabase" : "mock";
}
