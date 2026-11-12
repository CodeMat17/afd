"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, type ReactNode } from "react";

const className = "font-semibold text-foreground underline underline-offset-4";

/** Params worth keeping when a shopper hops between sign-in and sign-up. */
const CARRIED = ["next", "email"] as const;

/**
 * A link between the sign-in and sign-up pages that keeps `?next=` and
 * `?email=`, so someone sent from checkout still returns there.
 */
export function AuthSwitchLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <Link href={href} className={className}>
          {children}
        </Link>
      }
    >
      <WithParams href={href}>{children}</WithParams>
    </Suspense>
  );
}

function WithParams({ href, children }: { href: string; children: ReactNode }) {
  const params = useSearchParams();
  const kept = new URLSearchParams();
  for (const key of CARRIED) {
    const value = params.get(key);
    if (value) kept.set(key, value);
  }
  const query = kept.toString();
  return (
    <Link href={query ? `${href}?${query}` : href} className={className}>
      {children}
    </Link>
  );
}
