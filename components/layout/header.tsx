"use client";

import { ArrowRight, ChevronDown, Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Suspense, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { CategoryImage } from "@/components/ui/category-image";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useCartCount } from "@/lib/cart/use-cart";
import { savedStore, useIdList } from "@/lib/id-list-store";
import type { NavDepartment } from "@/lib/catalog-tree";
import { primaryNav } from "@/lib/site";
import { overlay } from "@/lib/ui-store";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

export type { NavCategory, NavDepartment } from "@/lib/catalog-tree";

/**
 * usePathname() is request data on routes with unknown params, so the
 * path-aware header streams in; the fallback is the same header without
 * active-link state.
 */
export function Header({ departments }: { departments: NavDepartment[] }) {
  return (
    <Suspense fallback={<HeaderView departments={departments} pathname="" />}>
      <HeaderWithPath departments={departments} />
    </Suspense>
  );
}

function HeaderWithPath({ departments }: { departments: NavDepartment[] }) {
  return <HeaderView departments={departments} pathname={usePathname()} />;
}

function HeaderView({ departments, pathname }: { departments: NavDepartment[]; pathname: string }) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (current) => setScrolled(current > 8));

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-500",
        scrolled || shopOpen
          ? "border-border/70 bg-background/80 shadow-[0_10px_30px_-24px_rgb(52_45_40/0.5)] backdrop-blur-xl backdrop-saturate-150"
          : "border-transparent bg-background",
      )}
    >
      <div className="mx-auto grid h-(--header-height) max-w-360 grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 sm:px-6 lg:grid-cols-[auto_1fr_auto] lg:gap-8 lg:px-10">
        {/* Mobile: menu trigger */}
        <div className="flex items-center lg:hidden">
          <MobileMenu departments={departments} trigger={<Menu className="size-5" aria-hidden="true" />} />
        </div>

        <Logo className="justify-self-center lg:justify-self-start" preload />

        <nav aria-label="Primary" className="hidden justify-center lg:flex">
          <ul className="flex items-center gap-1">
            <li>
              <ShopMenu
                departments={departments}
                open={shopOpen}
                onOpenChange={setShopOpen}
                active={pathname.startsWith("/shop")}
              />
            </li>
            {primaryNav
              .filter((item) => item.href !== "/shop")
              .map((item) => (
                <li key={item.href}>
                  <NavLink href={item.href} active={pathname.startsWith(item.href)}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
          </ul>
        </nav>

        <div className="flex items-center justify-self-end gap-0.5">
          <SearchButton />
          <SavedLink />
          <Link
            href="/account"
            aria-label="Account"
            className="hidden size-11 items-center justify-center rounded-full transition-colors hover:bg-muted sm:flex"
          >
            <User className="size-5" aria-hidden="true" />
          </Link>
          <span className="hidden sm:contents">
            <ThemeToggle />
          </span>
          <CartButton />
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="group relative inline-flex h-11 items-center px-4 text-[0.8125rem] font-semibold tracking-[0.08em] uppercase"
    >
      {children}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-4 bottom-2 h-px origin-left bg-primary transition-transform duration-500 ease-silk",
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
        )}
      />
    </Link>
  );
}

function CountBadge({ count, tone = "primary" }: { count: number; tone?: "primary" | "ink" }) {
  return (
    <AnimatePresence>
      {count > 0 ? (
        <motion.span
          key={count}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
          aria-hidden="true"
          className={cn(
            "absolute top-1 right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[0.6875rem] font-bold tabular-nums",
            tone === "primary" ? "bg-primary text-primary-foreground" : "bg-foreground text-background",
          )}
        >
          {count}
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}

/** Opens the mini-cart drawer (the full cart page is one tap away inside it). */
export function CartButton() {
  const count = useCartCount();
  return (
    <button
      type="button"
      onClick={() => overlay.open("cart")}
      aria-haspopup="dialog"
      aria-label={count > 0 ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart, empty"}
      className="relative flex size-11 items-center justify-center rounded-full transition-colors hover:bg-muted"
    >
      <ShoppingBag className="size-5" aria-hidden="true" />
      <CountBadge count={count} />
    </button>
  );
}

function SavedLink() {
  const hydrated = useHydrated();
  const saved = useIdList(savedStore).length;
  const count = hydrated ? saved : 0;
  return (
    <Link
      href="/saved"
      aria-label={count > 0 ? `Saved, ${count} ${count === 1 ? "item" : "items"}` : "Saved items"}
      className="relative hidden size-11 items-center justify-center rounded-full transition-colors hover:bg-muted sm:flex"
    >
      <Heart className="size-5" aria-hidden="true" />
      <CountBadge count={count} tone="ink" />
    </Link>
  );
}

function SearchButton() {
  return (
    <button
      type="button"
      onClick={() => overlay.open("search")}
      aria-haspopup="dialog"
      aria-label="Search"
      aria-keyshortcuts="/ Control+K Meta+K"
      className="group flex size-11 items-center justify-center gap-2 rounded-full transition-colors hover:bg-muted xl:mr-2 xl:w-56 xl:justify-start xl:border xl:border-input xl:bg-surface xl:px-4 xl:text-sm xl:text-muted-foreground xl:hover:border-foreground xl:hover:bg-surface"
    >
      <Search className="size-5 xl:size-4" aria-hidden="true" />
      <span className="hidden flex-1 text-left xl:inline">Search the store…</span>
      <kbd className="hidden h-5 items-center rounded border bg-background px-1.5 font-sans text-[0.6875rem] font-semibold xl:inline-flex">
        /
      </kbd>
    </button>
  );
}

function ShopMenu({
  departments,
  open,
  onOpenChange,
  active,
}: {
  departments: NavDepartment[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  active: boolean;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !wrapperRef.current?.contains(event.target)) {
        onOpenChange(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  // Transient UI: reset when the route is hidden by <Activity>.
  useLayoutEffect(() => () => onOpenChange(false), [onOpenChange]);

  const scheduleClose = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => onOpenChange(false), 180);
  };
  const cancelClose = () => window.clearTimeout(closeTimer.current);

  return (
    <div
      ref={wrapperRef}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        cancelClose();
        onOpenChange(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") scheduleClose();
      }}
      onBlur={(e) => {
        if (!(e.relatedTarget instanceof Node) || !e.currentTarget.contains(e.relatedTarget)) {
          onOpenChange(false);
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="shop-menu"
        // Mouse users already opened it on hover; a click should not immediately close it.
        onClick={(e) => onOpenChange(e.detail === 0 || e.nativeEvent instanceof PointerEvent && e.nativeEvent.pointerType !== "mouse" ? !open : true)}
        className="group relative inline-flex h-11 items-center gap-1 px-4 text-[0.8125rem] font-semibold tracking-[0.08em] uppercase"
      >
        Shop
        <ChevronDown
          className={cn("size-3.5 transition-transform duration-300", open && "rotate-180")}
          aria-hidden="true"
        />
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-x-4 bottom-2 h-px origin-left bg-primary transition-transform duration-500 ease-silk",
            active || open ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
          )}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="shop-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-full border-y bg-background"
          >
            <div className="mx-auto grid max-w-360 grid-cols-[minmax(0,13rem)_minmax(0,1fr)] gap-10 px-10 py-10">
              <div className="flex flex-col justify-between">
                <div>
                  <p className="eyebrow text-muted-foreground">The collection</p>
                  <p className="mt-3 font-heading text-4xl leading-none">
                    Shop the <em className="text-primary">store</em>
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    Fabrics, ready-to-wear and finishing touches from the Nairobi showroom.
                  </p>
                </div>
                <Link
                  href="/shop"
                  onClick={() => onOpenChange(false)}
                  className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold"
                >
                  Shop everything
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </div>
              <ul className="grid grid-cols-4 gap-6">
                {departments.map((department, i) => (
                  <motion.li
                    key={department.slug}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={`/shop/${department.slug}`}
                      onClick={() => onOpenChange(false)}
                      className="group block"
                    >
                      <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-muted">
                        <CategoryImage
                          src={department.imageUrl}
                          name={department.name}
                          sizes="260px"
                          className="transition-transform duration-[1.2s] ease-silk group-hover:scale-105"
                        />
                      </div>
                      <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold">
                        {department.name}
                        <ArrowRight
                          className="size-3.5 -translate-x-1 opacity-0 transition-[translate,opacity] group-hover:translate-x-0 group-hover:opacity-100"
                          aria-hidden="true"
                        />
                      </p>
                      <p className="text-xs text-muted-foreground">{department.tagline}</p>
                    </Link>
                    <ul className="mt-4 space-y-1 border-t pt-3">
                      {department.categories.map((category) => (
                        <li key={category.slug}>
                          <Link
                            href={`/shop/${category.slug}`}
                            onClick={() => onOpenChange(false)}
                            className="flex items-center justify-between gap-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {category.name}
                            {category.productCount === 0 ? (
                              <span className="text-[0.625rem] font-semibold tracking-[0.12em] uppercase">Soon</span>
                            ) : null}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
