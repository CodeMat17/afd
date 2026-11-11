import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, RevealImage } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import { CategoryImage } from "@/components/ui/category-image";
import { Container, PageHeader } from "@/components/ui/section";
import { getCatalogTree } from "@/lib/repository";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description: `${site.legalName} — a showroom for African fabrics, clothing and accessories on ${site.address.street}, ${site.address.city}.`,
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const departments = await getCatalogTree();

  return (
    <>
      <PageHeader
        eyebrow="Our story"
        title={
          <>
            A showroom for <em className="text-primary">the whole occasion</em>
          </>
        }
        description={`${site.legalName} — on ${site.address.street}, ${site.address.city}.`}
      />

      <section className="relative isolate overflow-hidden bg-ink">
        <RevealImage className="relative h-[60svh] min-h-[22rem] lg:h-[80svh]">
          <Image
            src="/images/luxury-lace/1000597868-680x920.jpg"
            alt="A beaded ivory gown on a mannequin in front of shelves stacked with African print fabrics"
            fill
            sizes="100vw"
            preload
            className="animate-ken-burns object-cover object-[50%_30%] opacity-90"
          />
        </RevealImage>
        <div className="absolute inset-0 bg-linear-to-t from-ink/70 via-transparent to-transparent" />
      </section>

      <Container className="grid gap-12 py-20 lg:grid-cols-[1fr_1.2fr] lg:gap-24 lg:py-28">
        <Reveal>
          <p className="font-heading text-4xl leading-[1.05] sm:text-5xl">
            From the fabric to the crown — <em className="text-primary">under one roof.</em>
          </p>
        </Reveal>
        <Reveal delay={0.1} className="space-y-5 text-[0.9375rem] leading-relaxed text-muted-foreground sm:text-base">
          <p className="text-foreground">
            Every celebration has a moment when someone walks in and the whole room turns. A
            wedding, an introduction, a graduation, a Sunday thanksgiving — across Africa and its
            diaspora, these are days we dress for. {site.name} exists for that moment, and for
            everything it takes to get there.
          </p>
          <p>
            African cloth has never been just fabric. Its patterns speak of family, standing and
            celebration; its colours are chosen with intention. We carry that respect into every
            design on our shelves — bold everyday Ankara, strip-woven Kente shown with coordinating
            pieces, plush Isiagu with its lion and crown motifs, and stone-set lace and beaded tulle
            for the biggest occasions.
          </p>
          <p>
            But an outfit is more than its cloth, so we don&apos;t stop there. Our showroom on{" "}
            {site.address.street} in {site.address.city} brings the whole look under one roof:
            ready-to-wear pieces for women and men, auto gele and turbans that are ready the moment
            you are, ipele for the shoulder and beads for the neck and wrist. Come in, feel the
            fabric, hold it to the light and match it with a gele before you leave.
          </p>
          <p>
            Can&apos;t make it to Nairobi? Browse the collection here and send us your list on
            WhatsApp — we&apos;ll help you put the look together, from the fabric to the crown.
          </p>
        </Reveal>
      </Container>

      <section className="border-t bg-surface py-20 lg:py-28">
        <Container>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {departments.map((c, i) => (
              <li key={c.id}>
                <Reveal delay={i * 0.06}>
                  <Link href={`/shop/${c.slug}`} className="group block">
                    <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-muted">
                      <CategoryImage
                        src={c.imageUrl}
                        name={c.name}
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className="transition-transform duration-[1.4s] ease-silk group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-3 font-heading text-2xl">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.tagline}</p>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
          <Reveal className="mt-16 flex flex-wrap gap-3">
            <Link href="/shop" className={cn(buttonVariants({ size: "lg" }), "group")}>
              Shop the collection
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link href="/contact" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Visit the showroom
            </Link>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
