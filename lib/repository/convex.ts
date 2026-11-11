import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import type { Doc } from "@/convex/_generated/dataModel";
import { api, convexClient } from "@/lib/convex/server";
import type { CatalogRepository } from "@/lib/repository/types";
import type { GalleryImage, HeroImage, Product, ProductCategory, ProductDepartment } from "@/lib/types";

/** Tag for every cached catalogue read; admin writes call `updateTag(CATALOG_TAG)`. */
export const CATALOG_TAG = "catalog";

/**
 * Tag for the home page hero. Only saving /admin/hero calls
 * `updateTag(HERO_TAG)`; catalogue edits leave the cached hero untouched.
 */
export const HERO_TAG = "hero";

interface Catalog {
  departments: ProductDepartment[];
  categories: ProductCategory[];
  products: Product[];
  gallery: GalleryImage[];
  editorial: GalleryImage[];
}

/**
 * The whole catalogue is read from Convex in one query and cached. Admin
 * edits expire it immediately; changes made elsewhere (the seed script, the
 * Convex dashboard) show up within the hour.
 */
async function loadCatalog(): Promise<Catalog> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");

  const snapshot = await convexClient().query(api.catalog.snapshot, {});
  const gallery = snapshot.gallery.map(toGalleryImage);
  return {
    departments: snapshot.departments.map(toDepartment),
    categories: snapshot.categories.map(toCategory),
    products: snapshot.products.map(toProduct),
    gallery: gallery.filter((g) => g.kind === "gallery").map((g) => g.image),
    editorial: gallery.filter((g) => g.kind === "editorial").map((g) => g.image),
  };
}

/**
 * The hero photos, cached on their own (not part of `loadCatalog`) for as
 * long as Next.js allows. Product and category edits don't touch this entry;
 * it is refreshed when the admin saves the hero.
 */
async function loadHero(): Promise<HeroImage[]> {
  "use cache";
  cacheTag(HERO_TAG);
  cacheLife("max");

  const { images } = await convexClient().query(api.hero.get, {});
  return images.map((image) => ({ src: image.url, alt: "" }));
}

function toDepartment(d: Doc<"departments">): ProductDepartment {
  return {
    id: d._id,
    name: d.name,
    slug: d.slug,
    tagline: d.tagline,
    description: d.description,
    imageUrl: d.image?.url,
    sortOrder: d.sortOrder,
  };
}

function toCategory(c: Doc<"categories">): ProductCategory {
  return {
    id: c._id,
    departmentId: c.departmentId,
    name: c.name,
    slug: c.slug,
    tagline: c.tagline,
    description: c.description,
    imageUrl: c.image?.url,
    sortOrder: c.sortOrder,
  };
}

function toProduct(p: Doc<"products">): Product {
  return {
    id: p._id,
    categoryId: p.categoryId,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    description: p.description,
    price: p.price,
    currency: "USD",
    unit: p.unit,
    minimumQuantity: p.minimumQuantity,
    quantityStep: p.quantityStep,
    stockQuantity: p.stockQuantity,
    // A tracked product at 0 pieces shows as sold out without the admin
    // having to untick "Available"; restocking brings it straight back.
    isAvailable: p.isAvailable && (p.stockQuantity === null || Number(p.stockQuantity) > 0),
    isFeatured: p.isFeatured,
    createdAt: p.createdAt,
    colours: p.colours,
    details: p.details,
    sizes: p.sizes,
    images: p.images.map((image, index) => ({
      id: image.publicId,
      imageUrl: image.url,
      altText: image.altText,
      width: image.width,
      height: image.height,
      sortOrder: index,
      isPrimary: index === 0,
    })),
  };
}

function toGalleryImage(g: Doc<"galleryImages">): { kind: Doc<"galleryImages">["kind"]; image: GalleryImage } {
  return {
    kind: g.kind,
    image: {
      id: g._id,
      imageUrl: g.image.url,
      altText: g.altText,
      caption: g.caption,
      width: g.image.width,
      height: g.image.height,
      productSlug: g.productSlug,
    },
  };
}

export const convexRepository: CatalogRepository = {
  async getProducts() {
    return (await loadCatalog()).products;
  },
  async getFeaturedProducts(limit = 8) {
    return (await loadCatalog()).products.filter((p) => p.isFeatured).slice(0, limit);
  },
  async getProductBySlug(slug) {
    return (await loadCatalog()).products.find((p) => p.slug === slug) ?? null;
  },
  async getProductsByIds(ids) {
    const wanted = new Set(ids);
    return (await loadCatalog()).products.filter((p) => wanted.has(p.id));
  },
  async getProductsByCategory(categorySlug) {
    const { categories, products } = await loadCatalog();
    const category = categories.find((c) => c.slug === categorySlug);
    return category ? products.filter((p) => p.categoryId === category.id) : [];
  },
  async getProductsByDepartment(departmentSlug) {
    const { departments, categories, products } = await loadCatalog();
    const department = departments.find((d) => d.slug === departmentSlug);
    if (!department) return [];
    const ids = new Set(categories.filter((c) => c.departmentId === department.id).map((c) => c.id));
    return products.filter((p) => ids.has(p.categoryId));
  },
  async getRelatedProducts(product, limit = 4) {
    return (await loadCatalog()).products
      .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
      .slice(0, limit);
  },
  async getDepartments() {
    return (await loadCatalog()).departments;
  },
  async getDepartmentBySlug(slug) {
    return (await loadCatalog()).departments.find((d) => d.slug === slug) ?? null;
  },
  async getDepartmentById(id) {
    return (await loadCatalog()).departments.find((d) => d.id === id) ?? null;
  },
  async getCategories() {
    return (await loadCatalog()).categories;
  },
  async getCategoryBySlug(slug) {
    return (await loadCatalog()).categories.find((c) => c.slug === slug) ?? null;
  },
  async getCategoryById(id) {
    return (await loadCatalog()).categories.find((c) => c.id === id) ?? null;
  },
  async getGalleryImages() {
    return (await loadCatalog()).gallery;
  },
  async getEditorialImages() {
    return (await loadCatalog()).editorial;
  },
  getHeroImages: loadHero,
};
