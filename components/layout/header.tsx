"use client";

import { ArrowRight, ChevronDown, Menu, ShoppingBag, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Suspense, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useCartCount } from "@/lib/cart/use-cart";
import { primaryNav } from "@/lib/site";
import type { ProductCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

export type NavCategory = Pick<ProductCategory, "name" | "slug" | "tagline" | "imageUrl">;

/**
 * usePathname() is request data on routes with unknown params, so the
 * path-aware header streams in; the fallback is the same header without
 * active-link state.
 */
export function Header({ categories }: { categories: NavCategory[] }) {
  return (
    <Suspense fallback={<HeaderView categories={categories} pathname="" />}>
      <HeaderWithPath categories={categories} />
    </Suspense>
  );
}

function HeaderWithPath({ categories }: { categories: NavCategory[] }) {
  return <HeaderView categories={categories} pathname={usePathname()} />;
}

function HeaderView({ categories, pathname }: { categories: NavCategory[]; pathname: string }) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (current) => setScrolled(current > 8));

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-background transition-[border-color,box-shadow] duration-500",
        scrolled
          ? "border-border shadow-[0_10px_30px_-24px_rgb(52_45_40/0.5)]"
          : "border-transparent",
      )}
    >
      <div className="mx-auto grid h-(--header-height) max-w-360 grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 sm:px-6 lg:grid-cols-[auto_1fr_auto] lg:gap-8 lg:px-10">
        {/* Mobile: menu trigger */}
        <div className="flex items-center lg:hidden">
          <MobileMenu categories={categories} trigger={<Menu className="size-5" aria-hidden="true" />} />
        </div>

        <Logo className="justify-self-center lg:justify-self-start" preload />

        <nav aria-label="Primary" className="hidden justify-center lg:flex">
          <ul className="flex items-center gap-1">
            <li>
              <ShopMenu
                categories={categories}
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
          <Link
            href="/account"
            aria-label="Account"
            className="hidden size-11 items-center justify-center rounded-full transition-colors hover:bg-muted sm:flex"
          >
            <User className="size-5" aria-hidden="true" />
          </Link>
          <ThemeToggle />
          <CartLink />
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

export function CartLink() {
  const count = useCartCount();
  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart, empty"}
      className="relative flex size-11 items-center justify-center rounded-full transition-colors hover:bg-muted"
    >
      <ShoppingBag className="size-5" aria-hidden="true" />
      <AnimatePresence>
        {count > 0 ? (
          <motion.span
            key={count}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            aria-hidden="true"
            className="absolute top-1 right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[0.6875rem] font-bold text-primary-foreground tabular-nums"
          >
            {count}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </Link>
  );
}

function ShopMenu({
  categories,
  open,
  onOpenChange,
  active,
}: {
  categories: NavCategory[];
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
            <div className="mx-auto grid max-w-360 grid-cols-[minmax(0,1fr)_minmax(0,3fr)] gap-10 px-10 py-10">
              <div className="flex flex-col justify-between">
                <div>
                  <p className="eyebrow text-muted-foreground">The collection</p>
                  <p className="mt-3 font-heading text-4xl leading-none">
                    Shop by <em className="text-primary">fabric</em>
                  </p>
                </div>
                <Link
                  href="/shop"
                  onClick={() => onOpenChange(false)}
                  className="group inline-flex items-center gap-2 text-sm font-semibold"
                >
                  Shop all fabrics
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </div>
              <ul className="grid grid-cols-5 gap-4">
                {categories.map((category, i) => (
                  <motion.li
                    key={category.slug}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={`/shop/${category.slug}`}
                      onClick={() => onOpenChange(false)}
                      className="group block"
                    >
                      <div className="relative aspect-4/5 overflow-hidden rounded-sm bg-muted">
                        {category.imageUrl ? (
                          <Image
                            src={category.imageUrl}
                            alt=""
                            fill
                            sizes="220px"
                            className="object-cover transition-transform duration-[1.2s] ease-silk group-hover:scale-105"
                          />
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm font-semibold">{category.name}</p>
                      <p className="text-xs text-muted-foreground">{category.tagline}</p>
                    </Link>
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
