import Link from "next/link";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { whatsappUrl } from "@/lib/whatsapp";

/** Shown on a department or category that has no products online yet. */
export function CollectionEmpty({ name }: { name: string }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center sm:py-28">
      <span className="eyebrow text-primary">Arriving soon</span>
      <h2 className="mt-5 font-heading text-4xl leading-tight text-balance sm:text-5xl">
        {name} is on its way online
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        We&apos;re photographing these pieces now. Ask the showroom on WhatsApp what&apos;s in
        stock today, or keep browsing the rest of the store.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a
          href={whatsappUrl(`Hello ${site.name}, what do you have in ${name} at the moment?`)}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "whatsapp", size: "lg" })}
        >
          <WhatsAppIcon className="size-4" />
          Ask what&apos;s in stock
          <span className="sr-only">(opens in a new tab)</span>
        </a>
        <Link href="/shop" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
          Shop everything
        </Link>
      </div>
    </div>
  );
}
