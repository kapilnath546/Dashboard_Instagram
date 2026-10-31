import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Server-side helper to verify that the current request is from an authenticated admin.
 * If user is not logged in, redirects to /auth/login.
 * If user is logged in but NOT in admin_users, signs them out and redirects to /auth/login?error=unauthorized.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Query admin_users through current user's authenticated session (RLS allows checking own row)
  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!adminRow) {
    // Non-admin logged-in users must be signed out and redirected
    await supabase.auth.signOut();
    redirect("/auth/login?error=unauthorized");
  }

  return { supabase, user };
}
