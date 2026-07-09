"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

// ---------- tracks ----------

export async function createTrack(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const audience = String(formData.get("audience"));
  const { data, error } = await admin
    .from("tracks")
    .insert({
      slug: String(formData.get("slug")).trim().toLowerCase(),
      title: String(formData.get("title")).trim(),
      description: String(formData.get("description") ?? "").trim() || null,
      audience,
      age_band:
        audience === "kids" ? String(formData.get("age_band")) : null,
      sort_order: Number(formData.get("sort_order") ?? 0),
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  redirect(`/admin/content/${data.id}`);
}

export async function updateTrack(trackId: string, formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const audience = String(formData.get("audience"));
  await admin
    .from("tracks")
    .update({
      slug: String(formData.get("slug")).trim().toLowerCase(),
      title: String(formData.get("title")).trim(),
      description: String(formData.get("description") ?? "").trim() || null,
      audience,
      age_band: audience === "kids" ? String(formData.get("age_band")) : null,
      sort_order: Number(formData.get("sort_order") ?? 0),
    })
    .eq("id", trackId);
  revalidatePath(`/admin/content/${trackId}`);
}

export async function toggleTrackPublished(trackId: string, publish: boolean) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin
    .from("tracks")
    .update({ is_published: publish })
    .eq("id", trackId);
  revalidatePath("/admin/content");
  revalidatePath(`/admin/content/${trackId}`);
}

// ---------- modules ----------

export async function createModule(trackId: string, formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const { count } = await admin
    .from("modules")
    .select("id", { count: "exact", head: true })
    .eq("track_id", trackId);
  await admin.from("modules").insert({
    track_id: trackId,
    title: String(formData.get("title")).trim(),
    sort_order: count ?? 0,
  });
  revalidatePath(`/admin/content/${trackId}`);
}

// ---------- lessons ----------

export async function createLesson(
  trackId: string,
  moduleId: string,
  formData: FormData,
) {
  await requireAdmin();
  const admin = createAdminClient();
  const { count } = await admin
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("module_id", moduleId);
  const { data, error } = await admin
    .from("lessons")
    .insert({
      module_id: moduleId,
      title: String(formData.get("title")).trim(),
      estimated_minutes: Number(formData.get("estimated_minutes") ?? 7),
      sort_order: count ?? 0,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  redirect(`/admin/lesson/${data.id}`);
}

export async function toggleLessonPublished(
  lessonId: string,
  trackId: string,
  publish: boolean,
) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin
    .from("lessons")
    .update({ is_published: publish })
    .eq("id", lessonId);
  revalidatePath(`/admin/content/${trackId}`);
  revalidatePath(`/admin/lesson/${lessonId}`);
}

// ---------- blocks ----------

export async function saveBlock(
  lessonId: string,
  blockId: string | null,
  blockType: string,
  content: unknown,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  if (blockId) {
    const { error } = await admin
      .from("lesson_blocks")
      .update({ content })
      .eq("id", blockId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { count } = await admin
      .from("lesson_blocks")
      .select("id", { count: "exact", head: true })
      .eq("lesson_id", lessonId);
    const { error } = await admin.from("lesson_blocks").insert({
      lesson_id: lessonId,
      block_type: blockType,
      sort_order: count ?? 0,
      content,
    });
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath(`/admin/lesson/${lessonId}`);
  return { ok: true };
}

export async function deleteBlock(lessonId: string, blockId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("lesson_blocks").delete().eq("id", blockId);
  revalidatePath(`/admin/lesson/${lessonId}`);
}

export async function moveBlock(
  lessonId: string,
  blockId: string,
  direction: "up" | "down",
) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: blocks } = await admin
    .from("lesson_blocks")
    .select("id, sort_order")
    .eq("lesson_id", lessonId)
    .order("sort_order", { ascending: true });
  if (!blocks) return;
  const index = blocks.findIndex((b) => b.id === blockId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= blocks.length) return;

  await Promise.all([
    admin
      .from("lesson_blocks")
      .update({ sort_order: blocks[swapWith].sort_order })
      .eq("id", blocks[index].id),
    admin
      .from("lesson_blocks")
      .update({ sort_order: blocks[index].sort_order })
      .eq("id", blocks[swapWith].id),
  ]);
  revalidatePath(`/admin/lesson/${lessonId}`);
}

// ---------- plans ----------

export async function updatePlan(planId: string, formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const price = Number(formData.get("price_kes"));
  if (!Number.isFinite(price) || price < 0) return;
  await admin
    .from("plans")
    .update({
      price_kes: price,
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", planId);
  revalidatePath("/admin/plans");
}