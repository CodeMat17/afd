"use client";

import { ArrowUpRight, Heart, Mail, MapPin, Phone, Search, User, X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { CategoryImage } from "@/components/ui/category-image";
import type { NavDepartment } from "@/lib/catalog-tree";
import { primaryNav, site } from "@/lib/site";
import { overlay } from "@/lib/ui-store";
import { useDialog } from "@/lib/use-dialog";
import { whatsappUrl } from "@/lib/whatsapp";

export function MobileMenu({
  departments,
  trigger,
}: {
  departments: NavDepartment[];
  trigger: ReactNode;
}) {
  const { ref, isOpen, open, close, onClose } = useDialog();

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="-ml-2 flex size-11 items-center justify-center rounded-full transition-colors hover:bg-muted"
      >
        {trigger}
      </button>

      <dialog
        ref={ref}
        onClose={onClose}
        aria-label="Site menu"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-[min(90vw,420px)] max-w-none -translate-x-full bg-background p-0 text-foreground opacity-0 transition-all transition-discrete duration-500 ease-silk open:translate-x-0 open:opacity-100 starting:open:-translate-x-full starting:open:opacity-0"
      >
        <div className="flex h-full flex-col overflow-y-auto overscroll-contain">
          <div className="flex h-(--header-height) items-center justify-between border-b px-5">
            <p className="eyebrow text-muted-foreground">Menu</p>
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="-mr-2 flex size-11 items-center justify-center rounded-full transition-colors hover:bg-muted"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="px-5 pt-5">
            <button
              type="button"
              onClick={() => {
                close();
                overlay.open("search");
              }}
              className="flex h-12 w-full items-center gap-3 rounded-full border border-input bg-surface px-4 text-sm text-muted-foreground"
            >
              <Search className="size-4" aria-hidden="true" />
              Search products, colours, SKUs…
            </button>
          </div>

          <nav aria-label="Mobile" className="px-5 pt-6">
            <ul className="space-y-1">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    className="flex min-h-12 items-center justify-between font-heading text-4xl leading-tight"
                  >
                    {item.label}
                    <ArrowUpRight className="size-5 text-muted-foreground" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>

            <p className="eyebrow mt-8 text-muted-foreground">Shop by department</p>
            <ul className="mt-4 divide-y border-y">
              {departments.map((department) => (
                <li key={department.slug} className="py-4">
                  <Link href={`/shop/${department.slug}`} onClick={close} className="group flex items-center gap-4">
                    <span className="relative h-16 w-13 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <CategoryImage src={department.imageUrl} name={department.name} sizes="52px" showLabel={false} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-heading text-2xl leading-tight">{department.name}</span>
                      <span className="block text-xs text-muted-foreground">{department.tagline}</span>
                    </span>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </Link>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {department.categories.map((category) => (
                      <li key={category.slug}>
                        <Link
                          href={`/shop/${category.slug}`}
                          onClick={close}
                          className="inline-flex h-9 items-center rounded-full border border-input bg-surface px-3.5 text-[0.8125rem] font-semibold transition-colors hover:border-foreground"
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto space-y-1 border-t px-5 py-6 text-sm">
            <div className="mb-3 flex items-center justify-between rounded-full border pl-4">
              <span className="text-sm font-semibold">Appearance</span>
              <ThemeToggle />
            </div>
            <Link href="/account" onClick={close} className="flex min-h-11 items-center gap-3">
              <User className="size-4" aria-hidden="true" /> Account
            </Link>
            <Link href="/saved" onClick={close} className="flex min-h-11 items-center gap-3">
              <Heart className="size-4" aria-hidden="true" /> Saved items
            </Link>
            <a href={site.phone.href} className="flex min-h-11 items-center gap-3">
              <Phone className="size-4" aria-hidden="true" /> {site.phone.display}
            </a>
            <a href={`mailto:${site.email}`} className="flex min-h-11 items-center gap-3 break-all">
              <Mail className="size-4 shrink-0" aria-hidden="true" /> {site.email}
            </a>
            <a
              href={whatsappUrl(`Hello ${site.name}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center gap-3 text-whatsapp"
            >
              <WhatsAppIcon className="size-4" /> Chat on WhatsApp
            </a>
            <p className="flex min-h-11 items-center gap-3 text-muted-foreground">
              <MapPin className="size-4" aria-hidden="true" />
              {site.address.street}, {site.address.city}
            </p>
          </div>
        </div>
      </dialog>
    </>
  );
}
