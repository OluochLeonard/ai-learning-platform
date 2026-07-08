import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileSwitcher from "./ProfileSwitcher";

export default async function ProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("is_child", { ascending: true })
    .order("created_at", { ascending: true });

  const adult = profiles?.find((p) => !p.is_child) ?? null;
  const childProfiles = profiles?.filter((p) => p.is_child) ?? [];

  return (
    <ProfileSwitcher
      adult={adult}
      childProfiles={childProfiles}
      next={next ?? "/app"}
    />
  );
}
