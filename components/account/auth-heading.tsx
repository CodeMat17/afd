import type { ReactNode } from "react";

export function AuthHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <div className="mb-8">
      <p className="eyebrow text-primary">{eyebrow}</p>
      <h1 className="mt-3 font-heading text-5xl leading-[0.95] font-medium tracking-tight">{title}</h1>
      {description ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
    </div>
  );
}
