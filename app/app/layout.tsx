import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveProfile } from "@/lib/profile";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const activeProfile = await getActiveProfile();
  if (!activeProfile) redirect("/profiles");

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <Header profileName={activeProfile.display_name} />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}
