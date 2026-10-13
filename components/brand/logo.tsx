import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

/** Supplied brand logo. Swap the asset in `lib/site.ts`. */
export function Logo({
  className,
  preload = false,
}: {
  className?: string;
  preload?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} — home`}
      className={cn(
        "inline-flex shrink-0 items-center rounded-sm transition-opacity hover:opacity-80",
        className,
      )}
    >
      <Image
        src={site.logo.src}
        alt={site.logo.alt}
        width={site.logo.width}
        height={site.logo.height}
        preload={preload}
        className="h-11 w-auto lg:h-13"
      />
    </Link>
  );
}
