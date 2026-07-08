import { createClient } from "@/lib/supabase/server";

// The market is Kenya, so streak days roll over on Nairobi midnight
// regardless of where the server runs.
export function nairobiToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function nairobiYesterday(): string {
  const now = new Date();
  now.setUTCDate(now.getUTCDate() - 1);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export type StreakResult = {
  current: number;
  longest: number;
  extendedToday: boolean;
};

// Increment if last activity was yesterday, reset if older, no-op if
// already active today. RLS lets users write their own streak rows.
export async function updateStreak(profileId: string): Promise<StreakResult> {
  const supabase = await createClient();
  const today = nairobiToday();
  const yesterday = nairobiYesterday();

  const { data: existing } = await supabase
    .from("streaks")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (existing?.last_activity_date === today) {
    return {
      current: existing.current_streak,
      longest: existing.longest_streak,
      extendedToday: false,
    };
  }

  const current =
    existing?.last_activity_date === yesterday
      ? existing.current_streak + 1
      : 1;
  const longest = Math.max(current, existing?.longest_streak ?? 0);

  await supabase.from("streaks").upsert({
    profile_id: profileId,
    current_streak: current,
    longest_streak: longest,
    last_activity_date: today,
  });

  return { current, longest, extendedToday: true };
}
