/**
 * Central domain model. Money and quantities are decimal strings at the data
 * boundary; arithmetic happens in `lib/money.ts` with scaled integers.
 */

export type Currency = "USD";

/** Everything in the store is sold by the piece; kept as a type for order records. */
export type ProductUnit = "piece" | "metre" | "yard";

export interface ProductImage {
  id: string;
  imageUrl: string;
  altText: string;
  width: number;
  height: number;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductDetails {
  material?: string;
  width?: string;
  care?: string;
  patternNotes?: string;
  pieceLength?: string;
}

/**
 * Optional garment measurements entered from the dashboard. Free text so the
 * showroom can write "38 in", "M" or "UK 12". Only filled-in fields are shown.
 */
export interface GarmentSizes {
  /** Womenswear */
  bust?: string;
  waist?: string;
  /** Menswear */
  chest?: string;
  /** Trouser length */
  trouser?: string;
  /** Womenswear */
  hips?: string;
  dressLength?: string;
  /** Menswear */
  shoulder?: string;
  sleeve?: string;
  topLength?: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: string;
  currency: Currency;
  unit: ProductUnit;
  minimumQuantity: string;
  /** Valid quantity increment — "1" for whole pieces. */
  quantityStep: string;
  /** Pieces in stock, or null when stock isn't tracked for this product. */
  stockQuantity: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  /** ISO date used for "newest" sorting. */
  createdAt: string;
  colours: string[];
  details: ProductDetails;
  sizes?: GarmentSizes;
  images: ProductImage[];
}

/** Top-level grouping (Fabrics, Clothing, …) that categories belong to. */
export interface ProductDepartment {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  imageUrl?: string;
  sortOrder: number;
}

export interface ProductCategory {
  id: string;
  departmentId: string;
  name: string;
  slug: string;
  tagline: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  altText: string;
  caption: string;
  width: number;
  height: number;
  productSlug?: string;
}

export interface CartItem {
  productId: string;
  quantity: string;
}

export interface TaxDeclaration {
  readyToPayApplicableTaxes: boolean;
  taxId: string | null;
}

export type ShopSort = "featured" | "newest" | "price-asc" | "price-desc";

/** A photo in the home page hero reel, chosen in /admin/hero. */
export interface HeroImage {
  src: string;
  alt: string;
}
