"use client";

import { ArrowUpRight, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Price } from "@/components/product/price";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cartActions } from "@/lib/cart/store";
import { notify } from "@/lib/notify";
import type { Product } from "@/lib/types";
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
    <Card className="w-full gap-0 rounded-2xl p-2 shadow-xs transition-shadow duration-500 hover:shadow-lg hover:shadow-ink/10">
      <Link
        href={href}
        className="relative block aspect-4/5 overflow-hidden rounded-xl bg-muted"
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
            className="object-cover transition-transform duration-[1.4s] ease-silk group-hover/card:scale-[1.05]"
          />
        ) : null}
        <div className="absolute inset-0 bg-linear-to-t from-ink/30 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover/card:opacity-100" />
        <div className="absolute inset-x-2.5 top-2.5 flex flex-wrap items-start justify-between gap-1.5">
          {categoryName ? (
            <Badge className="bg-background/10 dark:bg-background/10 backdrop-blur-sm">
              {categoryName}
            </Badge>
          ) : (
            <span />
          )}
          {!product.isAvailable ? <Badge variant="destructive" className="bg-background/90">Sold out</Badge> : null}
        </div>
      </Link>

      <CardContent className="flex flex-1 flex-col px-2 pt-4 pb-3">
        <h3 className="font-heading text-[1.125rem] leading-[1.2] font-medium sm:text-[1.25rem]">
          <Link href={href} className="line-clamp-2 hover:text-primary focus-visible:text-primary">
            {product.name}
          </Link>
        </h3>
        <Price product={product} className="mt-2" />
        {product.minimumQuantity !== "1" ? (
          <p className="mt-0.5 text-xs text-muted-foreground">
            Min. {product.minimumQuantity} {unitLabel(product.unit, product.minimumQuantity)}
          </p>
        ) : null}
      </CardContent>

      <CardFooter className="mt-auto gap-1.5 border-t-0 bg-transparent p-0 px-0.5 pb-3">
        <Button
          size="sm"
          className="px-3"
          disabled={!product.isAvailable}
          onClick={() => addToCartWithNotice(product, product.minimumQuantity)}
          aria-label={product.isAvailable ? `Add to cart: ${product.name}` : `Sold out: ${product.name}`}
        >
          <Plus aria-hidden="true" />
          <span className="sr-only xl:not-sr-only">{product.isAvailable ? "Add to cart" : "Sold out"}</span>
        </Button>
        <Tooltip>
          <TooltipTrigger
            render={
              <a
                href={productEnquiryUrl(product)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`WhatsApp enquiry: ${product.name} (opens in a new tab)`}
                className={buttonVariants({ variant: "whatsapp", size: "icon-sm" })}
              />
            }
          >
            <WhatsAppIcon className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Enquire on WhatsApp</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                href={href}
                aria-label={`Details: ${product.name}`}
                className={buttonVariants({ variant: "outline", size: "icon-sm" })}
              />
            }
          >
            <ArrowUpRight aria-hidden="true" />
          </TooltipTrigger>
          <TooltipContent>View details</TooltipContent>
        </Tooltip>
      </CardFooter>
    </Card>
  );
}
