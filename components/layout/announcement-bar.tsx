import Link from "next/link";
import { announcement } from "@/lib/site";

export function AnnouncementBar() {
  if (!announcement) return null;
  return (
    <div className="bg-band text-band-foreground">
      <p className="mx-auto flex min-h-9 max-w-360 flex-wrap items-center justify-center gap-x-3 gap-y-0.5 px-4 py-1.5 text-center text-[0.75rem] leading-snug tracking-wide">
        <span>{announcement.message}</span>
        {announcement.href && announcement.linkLabel ? (
          <Link
            href={announcement.href}
            className="font-semibold text-gold underline-offset-4 hover:underline"
          >
            {announcement.linkLabel}
          </Link>
        ) : null}
      </p>
    </div>
  );
}
