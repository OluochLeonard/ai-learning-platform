"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AuthActionState = { error: string | null };

export async function signup(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!email || !password || !displayName) {
    return { error: "Fill in your name, email and password." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }
  if (!data.user) {
    return { error: "Something went wrong creating your account." };
  }

  const admin = createAdminClient();
  const { error: profileError } = await admin.from("profiles").insert({
    auth_user_id: data.user.id,
    is_child: false,
    display_name: displayName,
    phone: phone || null,
  });

  if (profileError) {
    return {
      error: "Account created but profile setup failed. Contact support.",
    };
  }

  if (!data.session) {
    redirect("/login?message=check-email");
  }

  redirect("/app");
}
