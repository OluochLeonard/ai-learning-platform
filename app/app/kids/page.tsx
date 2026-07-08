import { redirect } from "next/navigation";

// The catalog at /app/courses is audience-aware; with a child profile
// active it already shows their age band's tracks. Keep /app/kids as the
// gated entry point (proxy enforces a child profile) and send them there.
export default function KidsZonePage() {
  redirect("/app/courses");
}
