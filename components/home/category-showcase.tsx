import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Reveal, RevealImage } from "@/components/motion/reveal";
import { Container, SectionHeading } from "@/components/ui/section";
import type { ProductCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryShowcase({
  categories,
  counts,
}: {
  categories: ProductCategory[];
  counts: Record<string, number>;
}) {
  return (
    <section aria-labelledby="categories-title" className="py-20 sm:py-24 lg:py-32">
      <Container>
        <SectionHeading
          id="categories-title"
          eyebrow="Shop by fabric"
          title={
            <>
              Every fabric family, <em className="text-primary">one showroom</em>
            </>
          }
          description="Start with the cloth. Each collection groups designs by how they're made — printed, woven or embellished."
        />
      </Container>

      {/* Mobile: swipeable rail. Desktop: editorial mosaic. */}
      <div className="mt-10 lg:mt-14">
        <ul
          className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 sm:scroll-px-6 sm:px-6 lg:mx-auto lg:grid lg:max-w-360 lg:grid-cols-12 lg:grid-rows-[clamp(16rem,24vw,22rem)_clamp(16rem,24vw,22rem)] lg:gap-5 lg:overflow-visible lg:px-10"
        >
          {categories.map((category, i) => (
            <li
              key={category.id}
              className={cn(
                "w-[78vw] shrink-0 snap-start sm:w-[44vw] lg:w-auto",
                i === 0 && "lg:col-span-5 lg:row-span-2",
                i === 1 && "lg:col-span-4",
                i === 2 && "lg:col-span-3",
                i === 3 && "lg:col-span-3",
                i === 4 && "lg:col-span-4",
              )}
            >
              <Reveal delay={i * 0.08} className="h-full">
                <CategoryTile
                  category={category}
                  count={counts[category.id] ?? 0}
                  tall={i === 0}
                  delay={i * 0.08}
                />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CategoryTile({
  category,
  count,
  tall,
  delay,
}: {
  category: ProductCategory;
  count: number;
  tall: boolean;
  delay: number;
}) {
  return (
    <Link
      href={`/shop/${category.slug}`}
      className="group relative block h-full overflow-hidden rounded-2xl bg-ink text-ink-foreground"
    >
      <RevealImage
        delay={delay}
        className="relative aspect-4/5 h-full w-full lg:aspect-auto"
      >
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt=""
            fill
            sizes={tall ? "(min-width: 1024px) 40vw, 78vw" : "(min-width: 1024px) 30vw, 78vw"}
            className="object-cover transition-transform duration-[1.6s] ease-silk group-hover:scale-[1.07]"
          />
        ) : null}
      </RevealImage>
      <div className="absolute inset-0 bg-linear-to-t from-ink/90 via-ink/45 to-ink/5 transition-opacity duration-700 group-hover:opacity-90" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
        <div>
          <p className="eyebrow text-[0.625rem] text-ink-foreground/85">{category.tagline}</p>
          <h3 className={cn("mt-2 font-heading leading-none font-medium", tall ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl")}>
            {category.name}
          </h3>
          <p className="mt-2 text-xs text-ink-foreground/75">
            {count} {count === 1 ? "design" : "designs"}
          </p>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-ink-foreground/40 transition-all duration-500 group-hover:rotate-45 group-hover:border-ink-foreground group-hover:bg-ink-foreground group-hover:text-ink">
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
