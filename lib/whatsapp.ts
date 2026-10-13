import { site } from "@/lib/site";
import type { Product } from "@/lib/types";

const UNIT_PLURAL: Record<Product["unit"], string> = {
  piece: "pieces",
  metre: "metres",
  yard: "yards",
};

export function unitLabel(unit: Product["unit"], quantity = "1"): string {
  return quantity === "1" ? unit : UNIT_PLURAL[unit];
}

export function whatsappUrl(message: string): string {
  return `https://wa.me/${site.phone.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function productEnquiryUrl(
  product: Pick<Product, "name" | "sku" | "slug" | "unit">,
  quantity?: string,
): string {
  const lines = [
    `Hello ${site.name}, I'd like to ask about this fabric:`,
    `• ${product.name}`,
    `• SKU: ${product.sku}`,
  ];
  if (quantity) {
    lines.push(`• Quantity: ${quantity} ${unitLabel(product.unit, quantity)}`);
  }
  lines.push(`• ${site.url}/products/${product.slug}`);
  return whatsappUrl(lines.join("\n"));
}
