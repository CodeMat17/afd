"use client";

import { ArrowUpRight, Mail, MapPin, Phone, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import type { NavCategory } from "@/components/layout/header";
import { primaryNav, site } from "@/lib/site";
import { useDialog } from "@/lib/use-dialog";
import { whatsappUrl } from "@/lib/whatsapp";

export function MobileMenu({
  categories,
  trigger,
}: {
  categories: NavCategory[];
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

            <p className="eyebrow mt-8 text-muted-foreground">Shop by fabric</p>
            <ul className="mt-4 grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link href={`/shop/${category.slug}`} onClick={close} className="group block">
                    <div className="relative aspect-5/4 overflow-hidden rounded-xl bg-muted">
                      {category.imageUrl ? (
                        <Image
                          src={category.imageUrl}
                          alt=""
                          fill
                          sizes="45vw"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm font-semibold">{category.name}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto space-y-1 border-t px-5 py-6 text-sm">
            <Link href="/account" onClick={close} className="flex min-h-11 items-center gap-3">
              <User className="size-4" aria-hidden="true" /> Account
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
