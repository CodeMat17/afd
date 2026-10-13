import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { cacheLife } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import type { NavCategory } from "@/components/layout/header";
import { policyNav, primaryNav, site } from "@/lib/site";
import { whatsappUrl } from "@/lib/whatsapp";

async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export function Footer({ categories }: { categories: NavCategory[] }) {
  return (
    <footer className="grain relative overflow-hidden bg-band text-band-foreground">
      {/* Oversized wordmark */}
      <div aria-hidden="true" className="pointer-events-none select-none border-b border-band-foreground/10">
        <p className="mx-auto max-w-360 px-4 pt-14 font-heading text-[19vw] leading-[0.8] tracking-tight text-band-foreground/[0.07] sm:px-6 lg:px-10 lg:text-[14rem]">
          Fabric &amp; Design
        </p>
      </div>

      <div className="mx-auto grid max-w-360 gap-12 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:px-10">
        <div className="max-w-sm">
          <div className="inline-flex rounded-sm bg-ivory p-2">
            <Image
              src={site.logo.src}
              alt={site.logo.alt}
              width={site.logo.width}
              height={site.logo.height}
              className="h-12 w-auto"
            />
          </div>
          <p className="mt-6 text-sm leading-relaxed text-band-muted">
            {site.legalName}
            <br />
            {site.address.street}, {site.address.city}, {site.address.country}
          </p>
          <a
            href={whatsappUrl(`Hello ${site.name}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-band-foreground/25 px-5 text-sm font-semibold transition-colors hover:border-whatsapp hover:bg-whatsapp"
          >
            <WhatsAppIcon className="size-4" />
            Chat on WhatsApp
          </a>
        </div>

        <FooterColumn title="Shop">
          <FooterLink href="/shop">All fabrics</FooterLink>
          {categories.map((c) => (
            <FooterLink key={c.slug} href={`/shop/${c.slug}`}>
              {c.name}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Explore">
          {primaryNav
            .filter((item) => item.href !== "/shop")
            .map((item) => (
              <FooterLink key={item.href} href={item.href}>
                {item.label}
              </FooterLink>
            ))}
          <FooterLink href="/account">Account</FooterLink>
          <FooterLink href="/cart">Cart</FooterLink>
        </FooterColumn>

        <FooterColumn title="Contact">
          <li>
            <a href={site.phone.href} className="flex min-h-10 items-center gap-3 hover:text-primary">
              <Phone className="size-4 shrink-0 text-gold" aria-hidden="true" />
              {site.phone.display}
            </a>
          </li>
          <li>
            <a
              href={`mailto:${site.email}`}
              className="flex min-h-10 items-center gap-3 break-all hover:text-primary"
            >
              <Mail className="size-4 shrink-0 text-gold" aria-hidden="true" />
              {site.email}
            </a>
          </li>
          <li>
            <a
              href={site.maps.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-10 items-center gap-3 hover:text-primary"
            >
              <MapPin className="size-4 shrink-0 text-gold" aria-hidden="true" />
              Open in Google Maps
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          </li>
        </FooterColumn>
      </div>

      <div className="border-t border-band-foreground/10">
        <div className="mx-auto flex max-w-360 flex-col gap-4 px-4 py-6 text-xs text-band-muted sm:px-6 md:flex-row md:items-center md:justify-between lg:px-10">
          <p>
            © <CopyrightYear /> {site.legalName}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {policyNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-8 items-center hover:text-primary">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="eyebrow text-gold">{title}</h2>
      <ul className="mt-5 space-y-1 text-sm text-band-foreground/85">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="group inline-flex min-h-10 items-center gap-2 transition-colors hover:text-primary"
      >
        <span className="h-px w-0 bg-gold transition-all duration-500 group-hover:w-4" aria-hidden="true" />
        {children}
      </Link>
    </li>
  );
}
