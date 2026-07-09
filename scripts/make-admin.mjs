// Grants admin to an existing account: node scripts/make-admin.mjs you@example.com
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const email = process.argv[2];
if (!email) {
  console.error("usage: node scripts/make-admin.mjs <email>");
  process.exit(1);
}

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const vars = {};
env.split(/\r?\n/).forEach((l) => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) vars[m[1]] = m[2];
});

const admin = createClient(
  vars.NEXT_PUBLIC_SUPABASE_URL,
  vars.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const { data: users } = await admin.auth.admin.listUsers({ perPage: 200 });
const user = users.users.find(
  (u) => u.email?.toLowerCase() === email.toLowerCase(),
);
if (!user) {
  console.error(`no auth user with email ${email}`);
  process.exit(1);
}

const { data, error } = await admin
  .from("profiles")
  .update({ is_admin: true })
  .eq("auth_user_id", user.id)
  .select("id, display_name");
if (error) throw error;
console.log("admin granted:", data);