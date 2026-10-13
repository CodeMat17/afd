import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Reveal } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { whatsappUrl } from "@/lib/whatsapp";

export function ClosingCta({ image }: { image: { src: string; alt: string } }) {
  return (
    <section aria-labelledby="closing-title" className="relative isolate overflow-hidden bg-band text-band-foreground">
      <div className="absolute inset-0 -z-10">
        <Image
          src={image.src}
          alt=""
          fill
          sizes="100vw"
          className="animate-ken-burns object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-linear-to-r from-band via-band/80 to-band/30" />
      </div>
      <div className="mx-auto max-w-360 px-4 py-24 sm:px-6 sm:py-32 lg:px-10 lg:py-44">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-gold">Not sure where to start?</p>
          <h2 id="closing-title" className="mt-4 font-heading text-5xl leading-[0.92] font-medium tracking-tight sm:text-6xl lg:text-8xl">
            Find the cloth for <em className="text-gold">your occasion.</em>
          </h2>
          <p className="mt-6 max-w-md text-[0.9375rem] leading-relaxed text-band-muted">
            Browse the full catalogue, or send us a message with what you have in
            mind — colour, quantity, occasion.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/shop" className={cn(buttonVariants({ variant: "inverse", size: "lg" }), "group")}>
              Browse the catalogue
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <a
              href={whatsappUrl(`Hello ${site.name}, I'm looking for fabric for an occasion.`)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline-inverse", size: "lg" })}
            >
              <WhatsAppIcon className="size-4" />
              Message us
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
