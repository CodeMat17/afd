/**
 * Central domain model. Money and quantities are decimal strings at the data
 * boundary; arithmetic happens in `lib/money.ts` with scaled integers.
 */

export type Currency = "USD";

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

export interface FabricDetails {
  material?: string;
  width?: string;
  care?: string;
  patternNotes?: string;
  pieceLength?: string;
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
  /** Valid quantity increment, e.g. "1" for whole yards. */
  quantityStep: string;
  stockQuantity: string;
  isAvailable: boolean;
  isFeatured: boolean;
  /** ISO date used for "newest" sorting. */
  createdAt: string;
  colours: string[];
  details: FabricDetails;
  images: ProductImage[];
}

export interface ProductCategory {
  id: string;
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

/** Display snapshot copied into the cart so it can render before reconciling. */
export interface CartLineSnapshot {
  name: string;
  slug: string;
  sku: string;
  price: string;
  unit: ProductUnit;
  minimumQuantity: string;
  quantityStep: string;
  imageUrl: string;
  altText: string;
}

export interface StoredCartLine extends CartItem {
  snapshot: CartLineSnapshot;
}

export interface TaxDeclaration {
  readyToPayApplicableTaxes: boolean;
  taxId: string | null;
}

export type ShopSort = "featured" | "newest" | "price-asc" | "price-desc";
