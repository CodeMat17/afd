import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Category / department artwork. Fills its (relative, sized) parent. Sections
 * without photography yet get a typographic tile instead of an empty box.
 */
export function CategoryImage({
  src,
  name,
  sizes,
  priority,
  showLabel = true,
  className,
}: {
  src?: string;
  name: string;
  sizes: string;
  priority?: boolean;
  /** Show the "Arriving soon" caption on the placeholder. */
  showLabel?: boolean;
  className?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", className)}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className={cn(
        "grain absolute inset-0 flex items-end overflow-hidden bg-band p-[8%] text-band-foreground [container-type:size]",
        "bg-[repeating-linear-gradient(135deg,color-mix(in_oklab,var(--gold)_14%,transparent)_0_1px,transparent_1px_14px)]",
        className,
      )}
    >
      <span className="absolute inset-0 flex items-center justify-center font-heading text-[70cqh] leading-none text-gold/30 italic select-none">
        {name.charAt(0)}
      </span>
      {showLabel ? (
        <span className="relative font-heading text-lg leading-tight text-band-muted italic">Arriving soon</span>
      ) : null}
    </div>
  );
}
