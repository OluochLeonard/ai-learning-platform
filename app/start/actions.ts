"use server";

import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { FUNNEL_SESSION_COOKIE, recommendTrack } from "@/lib/funnel";

export async function submitQuiz(
  answers: Record<string, string>,
  utmSource: string | null,
  utmCampaign: string | null,
) {
  const cookieStore = await cookies();

  let sessionId = cookieStore.get(FUNNEL_SESSION_COOKIE)?.value;
  if (!sessionId) {
    sessionId = randomUUID();
    cookieStore.set(FUNNEL_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  const recommendation = recommendTrack(answers);

  // funnel_responses has no update policy and reads are server-side only,
  // so all funnel writes go through the admin client.
  const admin = createAdminClient();
  await admin.from("funnel_responses").insert({
    session_id: sessionId,
    answers: { ...answers, recommendation: recommendation.key },
    utm_source: utmSource || null,
    utm_campaign: utmCampaign || null,
  });

  redirect("/start/results");
}
