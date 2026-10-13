import { AlertCircle, Info } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FormAlert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: "info" | "error";
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  const Icon = tone === "error" ? AlertCircle : Info;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-md border p-4 text-sm leading-relaxed",
        tone === "error"
          ? "border-destructive/30 bg-destructive/5"
          : "border-gold/40 bg-gold/10",
        className,
      )}
    >
      <Icon
        className={cn("mt-0.5 size-4 shrink-0", tone === "error" ? "text-destructive" : "text-gold")}
        aria-hidden="true"
      />
      <div>
        <p className="font-semibold">{title}</p>
        {children ? <div className="mt-1 text-muted-foreground">{children}</div> : null}
      </div>
    </div>
  );
}
