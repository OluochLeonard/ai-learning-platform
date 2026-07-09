"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

function getClientHref() {
  const params = new URLSearchParams(window.location.search);
  const utm = new URLSearchParams();
  for (const key of ["utm_source", "utm_campaign"]) {
    const value = params.get(key);
    if (value) utm.set(key, value);
  }
  return utm.size > 0 ? `/start?${utm}` : "/start";
}

const subscribe = () => () => {};

// Keeps the landing page fully static while still carrying utm_* params
// through to the quiz, where they get saved with the funnel response.
export default function StartCta({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const href = useSyncExternalStore(subscribe, getClientHref, () => "/start");

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}