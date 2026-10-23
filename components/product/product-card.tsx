"use client";

import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Price } from "@/components/product/price";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cartActions } from "@/lib/cart/store";
import { notify } from "@/lib/notify";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { productEnquiryUrl, unitLabel } from "@/lib/whatsapp";

export function addToCartWithNotice(product: Product, quantity: string) {
  cartActions.add(product, quantity);
  const image = product.images[0];
  notify({
    title: "Added to cart",
    description: `${product.name} · ${quantity} ${unitLabel(product.unit, quantity)}`,
    imageUrl: image?.imageUrl,
    action: { label: "View cart", href: "/cart" },
  });
}

export function ProductCard({
  product,
  categoryName,
  priority = false,
}: {
  product: Product;
  categoryName?: string;
  priority?: boolean;
}) {
  const image = product.images.find((i) => i.isPrimary) ?? product.images[0];
  const href = `/products/${product.slug}`;

  return (
    <article className="group/card flex w-full flex-col">
      <div className="relative">
        <Link
          href={href}
          className="relative block aspect-4/5 overflow-hidden rounded-2xl bg-muted ring-1 ring-foreground/5"
          tabIndex={-1}
          aria-hidden="true"
        >
          {image ? (
            <Image
              src={image.imageUrl}
              alt=""
              fill
              preload={priority}
              sizes="(min-width: 1536px) 18vw, (min-width: 1024px) 23vw, (min-width: 640px) 31vw, 48vw"
              className={cn(
                "object-cover transition-[scale,filter] duration-[1.4s] ease-silk group-hover/card:scale-[1.06]",
                !product.isAvailable && "grayscale-[0.6]",
              )}
            />
          ) : null}
          <div className="absolute inset-0 bg-linear-to-t from-ink/45 via-ink/0 to-transparent opacity-0 transition-opacity duration-700 group-hover/card:opacity-100" />
          {!product.isAvailable ? (
            <Badge className="absolute top-3 left-3 h-6 border-white/15 bg-ink/55 px-2.5 text-[0.625rem] font-semibold tracking-[0.16em] text-ink-foreground uppercase backdrop-blur-md">
              Sold out
            </Badge>
          ) : null}
        </Link>

        {product.isAvailable ? (
          <button
            type="button"
            onClick={() => addToCartWithNotice(product, product.minimumQuantity)}
            aria-label={`Add to cart: ${product.name}`}
            className={cn(
              "absolute right-3 bottom-3 flex size-10 items-center justify-center gap-2 rounded-full border border-white/20 bg-background/80 text-sm font-semibold text-foreground shadow-[0_10px_30px_-12px_rgb(15_12_10/0.6)] backdrop-blur-xl transition-[translate,opacity,background-color,color] duration-500 ease-silk hover:bg-primary hover:text-primary-foreground",
              "lg:inset-x-3 lg:h-11 lg:w-auto lg:translate-y-2 lg:opacity-0 lg:group-hover/card:translate-y-0 lg:group-hover/card:opacity-100 lg:focus-visible:translate-y-0 lg:focus-visible:opacity-100",
            )}
          >
            <Plus className="size-4" aria-hidden="true" />
            <span className="sr-only lg:not-sr-only">Add to cart</span>
          </button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-1 pt-4">
        {categoryName ? (
          <p className="text-[0.625rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            {categoryName}
          </p>
        ) : null}
        <h3 className="mt-1.5 font-heading text-[1.1875rem] leading-[1.15] font-medium sm:text-[1.375rem]">
          <Link
            href={href}
            className="line-clamp-2 bg-linear-to-r from-current to-current bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 ease-silk hover:bg-[length:100%_1px] focus-visible:bg-[length:100%_1px]"
          >
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            <Price product={product} />
            {product.minimumQuantity !== "1" ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Min. {product.minimumQuantity} {unitLabel(product.unit, product.minimumQuantity)}
              </p>
            ) : null}
          </div>
          <Tooltip>
            <TooltipTrigger
              render={
                <a
                  href={productEnquiryUrl(product)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`WhatsApp enquiry: ${product.name} (opens in a new tab)`}
                  className="flex size-10 shrink-0 items-center justify-center rounded-full border border-foreground/10 text-whatsapp transition-colors hover:border-whatsapp hover:bg-whatsapp hover:text-white"
                />
              }
            >
              <WhatsAppIcon className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Enquire on WhatsApp</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </article>
  );
}
