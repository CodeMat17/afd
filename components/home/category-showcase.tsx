import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Reveal, RevealImage } from "@/components/motion/reveal";
import { CategoryImage } from "@/components/ui/category-image";
import { Container, SectionHeading } from "@/components/ui/section";
import type { NavDepartment } from "@/lib/catalog-tree";
import { cn } from "@/lib/utils";

/** Home page department mosaic: one large lead tile, three supporting tiles. */
export function CategoryShowcase({ departments }: { departments: NavDepartment[] }) {
  return (
    <section aria-labelledby="categories-title" className="py-20 sm:py-24 lg:py-32">
      <Container>
        <SectionHeading
          id="categories-title"
          eyebrow="Shop by department"
          title={
            <>
              Everything for the occasion, <em className="text-primary">one showroom</em>
            </>
          }
          description="Choose your fabric, find a finished outfit, then complete the look with gele, ipele and beads."
        />
      </Container>

      {/* Mobile: swipeable rail. Desktop: editorial mosaic. */}
      <div className="mt-10 lg:mt-14">
        <ul className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 sm:scroll-px-6 sm:px-6 lg:mx-auto lg:grid lg:max-w-360 lg:grid-cols-12 lg:grid-rows-[clamp(16rem,24vw,22rem)_clamp(16rem,24vw,22rem)] lg:gap-5 lg:overflow-visible lg:px-10">
          {departments.map((department, i) => (
            <li
              key={department.id}
              className={cn(
                "w-[78vw] shrink-0 snap-start sm:w-[44vw] lg:w-auto",
                i === 0 && "lg:col-span-6 lg:row-span-2",
                i === 1 && "lg:col-span-6",
                i >= 2 && "lg:col-span-3",
              )}
            >
              <Reveal delay={i * 0.08} className="h-full">
                <DepartmentTile department={department} tall={i === 0} delay={i * 0.08} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function DepartmentTile({
  department,
  tall,
  delay,
}: {
  department: NavDepartment;
  tall: boolean;
  delay: number;
}) {
  const count = department.productCount;
  return (
    <Link
      href={`/shop/${department.slug}`}
      className="group relative block h-full overflow-hidden rounded-2xl bg-ink text-ink-foreground"
    >
      <RevealImage delay={delay} className="relative aspect-4/5 h-full w-full lg:aspect-auto">
        <CategoryImage
          src={department.imageUrl}
          name={department.name}
          showLabel={false}
          sizes={tall ? "(min-width: 1024px) 48vw, 78vw" : "(min-width: 1024px) 30vw, 78vw"}
          className="transition-transform duration-[1.6s] ease-silk group-hover:scale-[1.07]"
        />
      </RevealImage>
      <div className="absolute inset-0 bg-linear-to-t from-ink/90 via-ink/45 to-ink/5 transition-opacity duration-700 group-hover:opacity-90" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
        <div className="min-w-0">
          <p className="eyebrow text-[0.625rem] text-ink-foreground/85">{department.tagline}</p>
          <h3
            className={cn(
              "mt-2 font-heading leading-none font-medium",
              tall ? "text-4xl sm:text-6xl" : "text-3xl sm:text-4xl",
            )}
          >
            {department.name}
          </h3>
          <p className="mt-3 line-clamp-2 text-xs text-ink-foreground/75">
            {department.categories.map((c) => c.name).join(" · ")}
          </p>
          <p className="mt-1.5 text-[0.625rem] font-semibold tracking-[0.16em] text-gold uppercase">
            {count > 0 ? `${count} ${count === 1 ? "piece" : "pieces"}` : "Arriving soon"}
          </p>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-ink-foreground/40 transition-all duration-500 group-hover:rotate-45 group-hover:border-ink-foreground group-hover:bg-ink-foreground group-hover:text-ink">
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
