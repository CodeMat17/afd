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
          className="mt-4 font-heading text-[2.5rem] leading-[0.95] font-medium tracking-tight text-balance sm:text-5xl lg:text-6xl"
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
    <header className={cn("border-b", className)}>
      <Container className="pt-10 pb-10 sm:pt-14 lg:pt-20 lg:pb-14">
        {children}
        {eyebrow ? (
          <p className="eyebrow flex items-center gap-3 text-primary">
            <span className="h-px w-8 bg-current" aria-hidden="true" />
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-4 font-heading text-5xl leading-[0.92] font-medium tracking-tight text-balance sm:text-6xl lg:text-7xl">
          {title}
        </h1>
        {description ? (
          <div className="mt-5 max-w-2xl text-[0.9375rem] leading-relaxed text-muted-foreground sm:text-base">
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
        "flex gap-3 rounded-md border border-gold/40 bg-gold/10 p-4 text-sm leading-relaxed",
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
