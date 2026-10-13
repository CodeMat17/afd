import type { MetadataRoute } from "next";
import { catalog } from "@/lib/repository";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    catalog.getProducts(),
    catalog.getCategories(),
  ]);

  const staticRoutes = ["", "/shop", "/gallery", "/about", "/contact", "/shipping-returns"];

  return [
    ...staticRoutes.map((path) => ({ url: `${site.url}${path}` })),
    ...categories.map((c) => ({ url: `${site.url}/shop/${c.slug}` })),
    ...products.map((p) => ({ url: `${site.url}/products/${p.slug}` })),
  ];
}
