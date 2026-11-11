import type { MetadataRoute } from "next";
import { catalog } from "@/lib/repository";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, departments] = await Promise.all([
    catalog.getProducts(),
    catalog.getCategories(),
    catalog.getDepartments(),
  ]);

  const staticRoutes = ["", "/shop", "/gallery", "/about", "/contact"];

  return [
    ...staticRoutes.map((path) => ({ url: `${site.url}${path}` })),
    ...departments.map((d) => ({ url: `${site.url}/shop/${d.slug}` })),
    ...categories.map((c) => ({ url: `${site.url}/shop/${c.slug}` })),
    ...products.map((p) => ({ url: `${site.url}/products/${p.slug}` })),
  ];
}
