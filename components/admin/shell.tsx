"use client";

import {
  ExternalLink,
  GalleryHorizontalEnd,
  Images,
  LayoutDashboard,
  LogOut,
  Package,
  ReceiptText,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { logout } from "@/app/admin/actions";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  /** Shorter label for the phone tab bar. */
  short: string;
  description: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { href: "/admin", label: "Overview", short: "Home", description: "Today at a glance", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", short: "Orders", description: "Payments & deliveries", icon: ReceiptText },
  { href: "/admin/products", label: "Products", short: "Products", description: "Catalogue & stock", icon: Package },
  { href: "/admin/hero", label: "Home page hero", short: "Hero", description: "Photos at the top of the shop", icon: GalleryHorizontalEnd },
  { href: "/admin/gallery", label: "Gallery", short: "Gallery", description: "Looks on the gallery page", icon: Images },
  {
    href: "/admin/settings",
    label: "Settings",
    short: "Settings",
    description: "Contact details, tax & delivery",
    icon: SlidersHorizontal,
  },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The dashboard frame: a sidebar on desktop; on phones a slim top bar and a
 * thumb-friendly tab bar along the bottom.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background lg:pl-72">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-foreground/[0.07] bg-card lg:flex">
        <div className="px-6 pt-7 pb-6">
          <Brand />
        </div>
        <p className="eyebrow px-6 pb-3 text-muted-foreground">Manage</p>
        <Suspense fallback={<SideNav pathname="" />}>
          <SideNavWithPath />
        </Suspense>

        <div className="mt-auto space-y-3 p-4">
          <Link
            href="/"
            target="_blank"
            className="group grain flex items-center gap-3 overflow-hidden rounded-2xl bg-band p-4 text-band-foreground transition-transform duration-300 ease-silk hover:-translate-y-0.5"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-band-foreground/10">
              <ExternalLink className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">View your store</span>
              <span className="block truncate text-xs text-band-muted">See it as customers do</span>
            </span>
          </Link>
          <div className="flex items-center justify-between rounded-2xl px-1">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Phone & tablet top bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-foreground/[0.07] bg-card/85 px-4 backdrop-blur-xl sm:px-6 lg:hidden">
        <Brand compact />
        <div className="flex items-center gap-1">
          <Link
            href="/"
            target="_blank"
            aria-label="View your store (opens in a new tab)"
            className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-muted"
          >
            <ExternalLink className="size-[1.125rem]" aria-hidden="true" />
          </Link>
          <ThemeToggle />
          <SignOutButton compact />
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 pt-8 pb-32 sm:px-6 lg:px-10 lg:pt-12 lg:pb-20">{children}</div>

      <Suspense fallback={<TabBar pathname="" />}>
        <TabBarWithPath />
      </Suspense>
    </div>
  );
}

function Brand({ compact }: { compact?: boolean }) {
  return (
    <Link href="/admin" className="flex items-center gap-3 rounded-xl" aria-label={`${site.name} admin — overview`}>
      <span className="flex shrink-0 items-center rounded-lg bg-ivory p-1.5 ring-1 ring-foreground/5">
        <Image
          src={site.logo.src}
          alt=""
          width={site.logo.width}
          height={site.logo.height}
          className={cn("w-auto", compact ? "h-7" : "h-9")}
        />
      </span>
      <span className="min-w-0 leading-tight">
        <span className={cn("block font-heading font-medium text-balance", compact ? "sr-only" : "text-lg")}>{site.name}</span>
        <span
          className={cn(
            "block font-semibold tracking-[0.18em] text-muted-foreground uppercase",
            compact ? "text-xs" : "mt-1 text-[0.6875rem]",
          )}
        >
          Store admin
        </span>
      </span>
    </Link>
  );
}

function SideNavWithPath() {
  return <SideNav pathname={usePathname()} />;
}

function SideNav({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Admin" className="space-y-1 px-3">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-[background-color,box-shadow] duration-200",
              active
                ? "bg-background shadow-[0_1px_2px_rgb(52_45_40/0.06)] ring-1 ring-foreground/[0.08]"
                : "hover:bg-muted/70",
            )}
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:text-foreground",
              )}
            >
              <Icon className="size-[1.125rem]" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className={cn("block text-sm font-semibold", !active && "text-foreground/85")}>{item.label}</span>
              <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function TabBarWithPath() {
  return <TabBar pathname={usePathname()} />;
}

function TabBar({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Admin"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-foreground/[0.07] bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-6">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 px-1 pt-2.5 pb-2 text-[0.6875rem] font-semibold transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-12 items-center justify-center rounded-full transition-colors",
                    active && "bg-primary/12",
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                {item.short}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function SignOutButton({ compact }: { compact?: boolean }) {
  return (
    <form action={logout}>
      <button
        type="submit"
        aria-label={compact ? "Sign out" : undefined}
        className={cn(
          "inline-flex items-center gap-2 rounded-full text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          compact ? "size-11 justify-center" : "h-11 px-4",
        )}
      >
        <LogOut className="size-[1.125rem]" aria-hidden="true" />
        {compact ? null : "Sign out"}
      </button>
    </form>
  );
}
