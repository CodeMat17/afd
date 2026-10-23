import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-360 px-4 sm:px-6 lg:px-10", className)}>
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-5 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="eyebrow flex items-center gap-3 text-primary">
            <span className="h-px w-8 bg-current" aria-hidden="true" />
            {eyebrow}
          </p>
        ) : null}
        <h2
          id={id}
          className="mt-5 font-heading text-[2.5rem] leading-[0.92] font-medium tracking-[-0.02em] text-balance sm:text-5xl lg:text-[4rem]"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </Reveal>
  );
}

/** Title block for inner pages. */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "grain relative isolate overflow-hidden border-b border-band-foreground/10 bg-band text-band-foreground [--foreground:var(--band-foreground)] [--muted-foreground:var(--band-muted)]",
        className,
      )}
    >
      {/* Ambient light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 -right-40 -z-10 size-176 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--gold)_14%,transparent),transparent)] blur-2xl"
      />
      <Container className="pt-10 pb-12 sm:pt-14 lg:pt-20 lg:pb-16">
        {children}
        {eyebrow ? (
          <p className="eyebrow flex items-center gap-3 text-gold">
            <span className="h-px w-10 bg-gold/60" aria-hidden="true" />
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-5 font-heading text-5xl leading-[0.9] font-medium tracking-[-0.02em] text-balance sm:text-6xl lg:text-[5.25rem] [&_em]:text-gold">
          {title}
        </h1>
        {description ? (
          <div className="mt-6 max-w-2xl text-[0.9375rem] leading-relaxed text-pretty text-band-muted sm:text-base">
            {description}
          </div>
        ) : null}
      </Container>
    </header>
  );
}

/** Clearly identifies features that are not yet operational. */
export function PreviewNotice({
  title = "Preview only",
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="note"
      className={cn(
        "flex gap-3 rounded-2xl border border-gold/30 bg-gold/8 p-4 text-sm leading-relaxed",
        className,
      )}
    >
      <span className="mt-1 size-2 shrink-0 rounded-full bg-gold" aria-hidden="true" />
      <div>
        <p className="font-semibold">{title}</p>
        <div className="mt-1 text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}
