"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { setActiveProfileCookie } from "@/lib/profile";

export async function selectProfile(formData: FormData) {
  const profileId = String(formData.get("profile_id") ?? "");
  const next = String(formData.get("next") ?? "/app");
  if (!profileId) redirect("/profiles");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS on `profiles` already scopes this to the account's own rows, so a
  // miss here means the id doesn't belong to this account.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", profileId)
    .single();
  if (!profile) redirect("/profiles");

  await setActiveProfileCookie(profileId);
  redirect(next);
}

export async function createChildProfile(formData: FormData) {
  const displayName = String(formData.get("display_name") ?? "").trim();
  const ageBand = String(formData.get("age_band") ?? "");
  if (!displayName || (ageBand !== "8-12" && ageBand !== "13-17")) {
    redirect("/profiles");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: adult } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();
  if (!adult) redirect("/profiles");

  await supabase.from("profiles").insert({
    parent_profile_id: adult.id,
    is_child: true,
    display_name: displayName,
    age_band: ageBand,
  });

  redirect("/profiles");
}

export async function updateChildProfile(formData: FormData) {
  const profileId = String(formData.get("profile_id") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();
  const ageBand = String(formData.get("age_band") ?? "");
  if (
    !profileId ||
    !displayName ||
    (ageBand !== "8-12" && ageBand !== "13-17")
  ) {
    redirect("/profiles");
  }

  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ display_name: displayName, age_band: ageBand })
    .eq("id", profileId);

  redirect("/profiles");
}
