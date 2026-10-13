import Link from "next/link";
import { Container, PageHeader, PreviewNotice } from "@/components/ui/section";
import { site } from "@/lib/site";

export interface DraftSection {
  title: string;
  /** What the approved copy needs to cover. */
  covers: string;
}

/** Placeholder for policy pages until approved copy is supplied. */
export function DraftDocument({
  eyebrow,
  title,
  intro,
  reviewer,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  reviewer: string;
  sections: DraftSection[];
}) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={intro} />
      <Container className="grid gap-12 py-12 pb-24 lg:grid-cols-[16rem_1fr] lg:gap-20 lg:py-16">
        <nav aria-label="On this page" className="hidden lg:block">
          <div className="sticky top-[calc(var(--header-height)+1.5rem)]">
            <p className="eyebrow text-muted-foreground">On this page</p>
            <ol className="mt-4 space-y-1 text-sm">
              {sections.map((s, i) => (
                <li key={s.title}>
                  <a href={`#section-${i + 1}`} className="flex min-h-9 items-center gap-3 hover:text-primary">
                    <span className="text-xs text-muted-foreground tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>
        <div className="max-w-2xl">
          <PreviewNotice title={`Draft — requires ${reviewer} review`}>
            This page is a placeholder. It outlines what the final policy will cover; it is not the
            business&apos;s approved policy and should not be relied upon.
          </PreviewNotice>
          <ol className="mt-10 space-y-10">
            {sections.map((s, i) => (
              <li key={s.title} id={`section-${i + 1}`} className="scroll-mt-28 border-t pt-8">
                <h2 className="flex items-baseline gap-4 font-heading text-3xl">
                  <span className="text-lg text-primary italic tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </h2>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">To be confirmed: </span>
                  {s.covers}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-12 border-t pt-8 text-sm text-muted-foreground">
            Questions in the meantime? Email{" "}
            <a href={`mailto:${site.email}`} className="font-semibold text-foreground underline underline-offset-4">
              {site.email}
            </a>{" "}
            or visit the{" "}
            <Link href="/contact" className="font-semibold text-foreground underline underline-offset-4">
              contact page
            </Link>
            .
          </p>
        </div>
      </Container>
    </>
  );
}
