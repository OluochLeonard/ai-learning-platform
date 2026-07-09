import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const metadata = { title: "Admin" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-5 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <span className="text-sm font-bold text-zinc-900">
            PLATFORM Admin
          </span>
          <nav className="flex gap-4 text-sm font-medium text-zinc-600">
            <Link href="/admin" className="hover:text-zinc-900">
              Dashboard
            </Link>
            <Link href="/admin/content" className="hover:text-zinc-900">
              Content
            </Link>
            <Link href="/admin/plans" className="hover:text-zinc-900">
              Plans
            </Link>
            <Link href="/app" className="text-zinc-400 hover:text-zinc-600">
              Exit
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-6">{children}</main>
    </div>
  );
}