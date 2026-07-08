import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { ACTIVE_PROFILE_COOKIE } from "@/lib/profile";

export async function proxy(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isAppRoute = pathname === "/app" || pathname.startsWith("/app/");
  const isCheckoutRoute =
    pathname.startsWith("/checkout/") || pathname === "/welcome";
  if (!isAppRoute && !isCheckoutRoute) return response;

  if (!user) {
    const url = request.nextUrl.clone();
    // New visitors land on checkout from the paywall; send them to signup
    // rather than login so the funnel keeps moving.
    url.pathname = isCheckoutRoute ? "/signup" : "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isCheckoutRoute) return response;

  const activeProfileId = request.cookies.get(ACTIVE_PROFILE_COOKIE)?.value;

  if (!activeProfileId) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, is_child");

    const children = (profiles ?? []).filter((p) => p.is_child);
    if (children.length > 0) {
      const url = request.nextUrl.clone();
      url.pathname = "/profiles";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    const adult = (profiles ?? []).find((p) => !p.is_child);
    if (adult) {
      response.cookies.set(ACTIVE_PROFILE_COOKIE, adult.id, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return response;
  }

  const isKidsRoute =
    pathname === "/app/kids" || pathname.startsWith("/app/kids/");
  if (isKidsRoute) {
    const { data: activeProfile } = await supabase
      .from("profiles")
      .select("is_child")
      .eq("id", activeProfileId)
      .single();

    if (!activeProfile?.is_child) {
      const url = request.nextUrl.clone();
      url.pathname = "/app";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
