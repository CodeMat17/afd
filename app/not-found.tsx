import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-360 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-10 lg:py-24">
      <div className="relative mx-auto aspect-17/23 w-full max-w-sm overflow-hidden rounded-sm bg-muted lg:order-2">
        <Image
          src="/images/ankara/1000132850-680x920.jpg"
          alt=""
          fill
          sizes="(min-width: 1024px) 24rem, 80vw"
          className="animate-ken-burns object-cover"
        />
      </div>
      <div>
        <p className="eyebrow text-primary">Error 404</p>
        <h1 className="mt-4 font-heading text-6xl leading-[0.92] sm:text-7xl">
          This pattern <em className="text-primary">doesn&apos;t exist.</em>
        </h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
          The page or product you&apos;re looking for may have moved or sold through. The
          collection is a click away.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/shop" className={buttonVariants({ size: "lg" })}>
            Shop all fabrics
          </Link>
          <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
