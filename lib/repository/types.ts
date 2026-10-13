import type { GalleryImage, Product, ProductCategory } from "@/lib/types";

/**
 * Catalogue boundary. Presentation code depends only on this interface so a
 * Convex-backed implementation can replace the mock without UI changes.
 */
export interface ProductRepository {
  getProducts(): Promise<Product[]>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getProductsByIds(ids: string[]): Promise<Product[]>;
  getProductsByCategory(categorySlug: string): Promise<Product[]>;
  getRelatedProducts(product: Product, limit?: number): Promise<Product[]>;
}

export interface CategoryRepository {
  getCategories(): Promise<ProductCategory[]>;
  getCategoryBySlug(slug: string): Promise<ProductCategory | null>;
  getCategoryById(id: string): Promise<ProductCategory | null>;
}

export interface GalleryRepository {
  getGalleryImages(): Promise<GalleryImage[]>;
  /** Large-format imagery for the home page editorial sections. */
  getEditorialImages(): Promise<GalleryImage[]>;
}

export type CatalogRepository = ProductRepository &
  CategoryRepository &
  GalleryRepository;
