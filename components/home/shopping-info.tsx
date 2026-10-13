import { DollarSign, Mail, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/section";
import { site } from "@/lib/site";

/** Confirmed facts only — no invented guarantees, timings or testimonials. */
export function ShoppingInfo() {
  const items: { icon: ReactNode; title: string; body: ReactNode }[] = [
    {
      icon: <MapPin className="size-5" aria-hidden="true" />,
      title: "Visit the showroom",
      body: (
        <>
          {site.address.street}, {site.address.city}.{" "}
          <a href={site.maps.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-primary">
            Get directions
          </a>
        </>
      ),
    },
    {
      icon: <WhatsAppIcon className="size-5" />,
      title: "Enquire on WhatsApp",
      body: "Every product has a one-tap WhatsApp enquiry with the name, SKU and link filled in.",
    },
    {
      icon: <DollarSign className="size-5" aria-hidden="true" />,
      title: "Priced in USD",
      body: "All prices are shown in US dollars. Taxes and shipping are confirmed separately.",
    },
    {
      icon: <Mail className="size-5" aria-hidden="true" />,
      title: "Talk to us",
      body: (
        <>
          <a href={site.phone.href} className="hover:text-primary">{site.phone.display}</a>
          <br />
          <a href={`mailto:${site.email}`} className="break-all hover:text-primary">{site.email}</a>
        </>
      ),
    },
  ];

  return (
    <section aria-label="Shopping information" className="border-y bg-surface">
      <Container>
        <ul className="grid divide-y sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {items.map((item, i) => (
            <li key={item.title} className="py-8 sm:px-2 lg:px-8 lg:py-12 lg:first:pl-0 lg:last:pr-0">
              <Reveal delay={i * 0.08}>
                <span className="flex size-11 items-center justify-center rounded-full border border-primary/30 text-primary">
                  {item.icon}
                </span>
                <h3 className="mt-5 text-sm font-bold tracking-[0.12em] uppercase">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
