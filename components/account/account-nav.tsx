"use client";

import { LayoutGrid, Package } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/account", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/account/orders", label: "Orders", icon: Package, exact: false },
];

export function AccountNav() {
  return (
    <Suspense fallback={<AccountNavView pathname="" />}>
      <AccountNavWithPath />
    </Suspense>
  );
}

function AccountNavWithPath() {
  return <AccountNavView pathname={usePathname()} />;
}

function AccountNavView({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Account">
      <ul className="flex gap-2 lg:flex-col">
        {items.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-full px-4 text-sm font-semibold transition-colors lg:rounded-md",
                  active ? "bg-foreground text-background" : "hover:bg-muted",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
