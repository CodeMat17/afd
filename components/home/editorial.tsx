"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/section";

const pillars = [
  {
    title: "Printed",
    body: "Ankara in every register — graphic monochromes, botanicals, and prints finished with sequins.",
  },
  {
    title: "Woven",
    body: "Woven Kente cloths, many shown with coordinating folded pieces, shot through with metallic thread.",
  },
  {
    title: "Embellished",
    body: "Stone-set lace, beaded tulle and plush Isiagu for the occasions that call for ceremony.",
  },
];

export function Editorial({
  primary,
  secondary,
}: {
  primary: { src: string; alt: string };
  secondary: { src: string; alt: string };
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yLarge = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const ySmall = useTransform(scrollYProgress, [0, 1], ["18%", "-18%"]);

  return (
    <section ref={ref} aria-labelledby="editorial-title" className="overflow-hidden py-20 sm:py-24 lg:py-36">
      <Container className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div className="relative pb-16 sm:pb-20 lg:pb-0">
          <div className="relative aspect-17/23 w-[82%] overflow-hidden rounded-sm bg-muted">
            <motion.div style={{ y: yLarge }} className="absolute -inset-y-[10%] inset-x-0">
              <Image
                src={primary.src}
                alt={primary.alt}
                fill
                sizes="(min-width: 1024px) 38vw, 80vw"
                className="object-cover"
              />
            </motion.div>
          </div>
          <motion.div
            style={{ y: ySmall }}
            className="absolute right-0 bottom-0 aspect-17/23 w-[46%] overflow-hidden rounded-sm border-[6px] border-background bg-muted shadow-[0_30px_60px_-30px_rgb(31_26_22/0.6)]"
          >
            <Image
              src={secondary.src}
              alt={secondary.alt}
              fill
              sizes="(min-width: 1024px) 20vw, 45vw"
              className="object-cover"
            />
          </motion.div>
        </div>

        <div>
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-primary">
              <span className="h-px w-8 bg-current" aria-hidden="true" />
              Our story
            </p>
            <h2
              id="editorial-title"
              className="mt-4 font-heading text-[2.75rem] leading-[0.95] font-medium tracking-tight text-balance sm:text-6xl lg:text-7xl"
            >
              Pattern is a language. <em className="text-primary">Colour</em> is a celebration.
            </h2>
            <p className="mt-6 max-w-lg text-[0.9375rem] leading-relaxed text-muted-foreground sm:text-base">
              African Fabric and Designs brings printed, woven and embellished
              textiles together under one roof on Marcus Garvey Road, Nairobi —
              from everyday Ankara to ceremonial Kente, Isiagu and stone-set lace.
            </p>
          </Reveal>

          <ol className="mt-10 divide-y border-y">
            {pillars.map((pillar, i) => (
              <li key={pillar.title}>
                <Reveal delay={i * 0.1} className="grid grid-cols-[3rem_1fr] gap-4 py-5">
                  <span className="font-heading text-xl text-primary italic tabular-nums">
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold tracking-[0.14em] uppercase">{pillar.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>

          <Reveal delay={0.2}>
            <Link
              href="/about"
              className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline decoration-foreground/25 underline-offset-[6px] transition-colors hover:decoration-primary"
            >
              Read about the showroom
            </Link>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
