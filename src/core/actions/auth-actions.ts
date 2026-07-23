"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/core/supabase/server";

export async function logoutAction() {
  const supabase = await getSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/login");
}
