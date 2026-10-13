import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ContactForm } from "@/components/contact/contact-form";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Reveal } from "@/components/motion/reveal";
import { Container, PageHeader } from "@/components/ui/section";
import { site } from "@/lib/site";
import { whatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact",
  description: `Visit ${site.legalName} on ${site.address.street}, ${site.address.city}, or call ${site.phone.display}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title={
          <>
            Visit, call or <em className="text-primary">write to us</em>
          </>
        }
        description="Questions about a fabric, quantities or colours? Reach the showroom directly."
      />

      <Container className="grid gap-14 py-12 pb-24 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20 lg:py-16">
        <div className="space-y-10">
          <Reveal>
            <h2 className="font-heading text-3xl">{site.legalName}</h2>
            <ul className="mt-6 divide-y border-y">
              <ContactRow icon={<MapPin className="size-4" aria-hidden="true" />} label="Address">
                {site.address.street}, {site.address.city}, {site.address.country}
              </ContactRow>
              <ContactRow icon={<Phone className="size-4" aria-hidden="true" />} label="Phone">
                <a href={site.phone.href} className="hover:text-primary">{site.phone.display}</a>
              </ContactRow>
              <ContactRow icon={<Mail className="size-4" aria-hidden="true" />} label="Email">
                <a href={`mailto:${site.email}`} className="break-all hover:text-primary">{site.email}</a>
              </ContactRow>
              <ContactRow icon={<WhatsAppIcon className="size-4" />} label="WhatsApp">
                <a
                  href={whatsappUrl(`Hello ${site.name}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-whatsapp hover:underline"
                >
                  Chat with the showroom<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </ContactRow>
            </ul>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-md border bg-muted">
              <iframe
                title={`Map showing ${site.legalName} on ${site.address.street}, ${site.address.city}`}
                src={site.maps.embed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block aspect-4/3 w-full border-0 grayscale-[35%]"
              />
            </div>
            <a
              href={site.maps.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline decoration-foreground/30 underline-offset-4 hover:decoration-primary"
            >
              Open in Google Maps <ArrowUpRight className="size-4" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </Reveal>
        </div>

        <Reveal delay={0.05}>
          <div className="rounded-md border bg-surface p-6 sm:p-10">
            <h2 className="font-heading text-4xl">Send a message</h2>
            <p className="mt-2 mb-8 text-sm text-muted-foreground">All fields are required unless marked optional.</p>
            <ContactForm />
          </div>
        </Reveal>
      </Container>
    </>
  );
}

function ContactRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <li className="grid grid-cols-[2.75rem_1fr] items-center gap-3 py-4">
      <span className="flex size-11 items-center justify-center rounded-full border text-primary">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-[0.9375rem] font-medium">{children}</p>
      </div>
    </li>
  );
}
