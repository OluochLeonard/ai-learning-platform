import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/profile";

export const ACTIVE_PROFILE_COOKIE = "active_profile_id";

// RLS on `profiles` (see schema.sql) scopes this to the signed-in user's own
// row plus any child rows hanging off it — no manual filtering needed.
export async function getAccountProfiles(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("is_child", { ascending: true })
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function getActiveProfile(): Promise<Profile | null> {
  const cookieStore = await cookies();
  const activeId = cookieStore.get(ACTIVE_PROFILE_COOKIE)?.value;
  const profiles = await getAccountProfiles();

  if (activeId) {
    const matched = profiles.find((p) => p.id === activeId);
    if (matched) return matched;
  }

  // No usable cookie yet on this request. proxy.ts auto-selects the adult
  // profile when the account has no children, but a cookie it sets on the
  // response isn't visible to a Server Component rendered in that same
  // request — so fall back to the same rule here rather than bouncing to
  // /profiles for an account that has nothing to pick between.
  const children = profiles.filter((p) => p.is_child);
  if (children.length === 0) {
    return profiles.find((p) => !p.is_child) ?? null;
  }

  return null;
}

export async function setActiveProfileCookie(profileId: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_PROFILE_COOKIE, profileId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
