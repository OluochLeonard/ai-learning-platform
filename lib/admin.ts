import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Gate for every /admin page and admin server action. Reads the caller's
// own profile under RLS and checks the is_admin flag; anything data-side
// after this gate uses the service-role client.
export async function requireAdmin(): Promise<{ profileId: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_admin")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/app");
  return { profileId: profile.id };
}