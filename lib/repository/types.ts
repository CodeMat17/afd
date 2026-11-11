import type {
  GalleryImage,
  HeroImage,
  Product,
  ProductCategory,
  ProductDepartment,
} from "@/lib/types";

/**
 * Catalogue boundary. Presentation code depends only on this interface; the
 * implementation lives in `lib/repository/convex.ts`.
 */
export interface ProductRepository {
  getProducts(): Promise<Product[]>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getProductsByIds(ids: string[]): Promise<Product[]>;
  getProductsByCategory(categorySlug: string): Promise<Product[]>;
  getProductsByDepartment(departmentSlug: string): Promise<Product[]>;
  getRelatedProducts(product: Product, limit?: number): Promise<Product[]>;
}

export interface CategoryRepository {
  getDepartments(): Promise<ProductDepartment[]>;
  getDepartmentBySlug(slug: string): Promise<ProductDepartment | null>;
  getDepartmentById(id: string): Promise<ProductDepartment | null>;
  getCategories(): Promise<ProductCategory[]>;
  getCategoryBySlug(slug: string): Promise<ProductCategory | null>;
  getCategoryById(id: string): Promise<ProductCategory | null>;
}

export interface GalleryRepository {
  getGalleryImages(): Promise<GalleryImage[]>;
  /** Large-format imagery for the home page editorial sections. */
  getEditorialImages(): Promise<GalleryImage[]>;
  /**
   * The home page hero photos. Set only from /admin/hero and cached under
   * their own tag, so product changes never alter them.
   */
  getHeroImages(): Promise<HeroImage[]>;
}

export type CatalogRepository = ProductRepository &
  CategoryRepository &
  GalleryRepository;
