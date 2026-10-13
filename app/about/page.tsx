import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, RevealImage } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import { Container, PageHeader, PreviewNotice } from "@/components/ui/section";
import { catalog } from "@/lib/repository";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description: `${site.legalName} — a textile showroom on ${site.address.street}, ${site.address.city}.`,
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const categories = await catalog.getCategories();

  return (
    <>
      <PageHeader
        eyebrow="Our story"
        title={
          <>
            A showroom for <em className="text-primary">African cloth</em>
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
            Printed, woven and embellished — <em className="text-primary">under one roof.</em>
          </p>
        </Reveal>
        <Reveal delay={0.1} className="space-y-5 text-[0.9375rem] leading-relaxed text-muted-foreground sm:text-base">
          <PreviewNotice title="Draft brand story">
            This page will carry the business&apos;s own history and voice. The text below sticks to
            what is confirmed: the showroom location and the fabrics it carries.
          </PreviewNotice>
          <p>
            From the showroom on {site.address.street} in {site.address.city}, {site.name} offers{" "}
            {categories.map((c) => c.name).join(", ").replace(/, ([^,]*)$/, " and $1")}.
          </p>
          <p>
            The collection spans bold everyday prints, strip-woven Kente shown with coordinating
            pieces, plush Isiagu with lion and crown motifs, and stone-set lace and beaded tulle for
            ceremonies.
          </p>
        </Reveal>
      </Container>

      <section className="border-t bg-surface py-20 lg:py-28">
        <Container>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((c, i) => (
              <li key={c.id}>
                <Reveal delay={i * 0.06}>
                  <Link href={`/shop/${c.slug}`} className="group block">
                    <div className="relative aspect-4/5 overflow-hidden rounded-sm bg-muted">
                      {c.imageUrl ? (
                        <Image
                          src={c.imageUrl}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 20vw, 50vw"
                          className="object-cover transition-transform duration-[1.4s] ease-silk group-hover:scale-105"
                        />
                      ) : null}
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
