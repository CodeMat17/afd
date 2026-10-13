import "server-only";

import { mockCategories } from "@/lib/data/categories";
import { mockEditorial } from "@/lib/data/editorial";
import { mockGallery } from "@/lib/data/gallery";
import { mockProducts } from "@/lib/data/products";
import type { CatalogRepository } from "@/lib/repository/types";

const byCategoryOrder = [...mockCategories].sort(
  (a, b) => a.sortOrder - b.sortOrder,
);

export const mockRepository: CatalogRepository = {
  async getProducts() {
    return mockProducts;
  },
  async getFeaturedProducts(limit = 8) {
    return mockProducts.filter((p) => p.isFeatured).slice(0, limit);
  },
  async getProductBySlug(slug) {
    return mockProducts.find((p) => p.slug === slug) ?? null;
  },
  async getProductsByIds(ids) {
    const wanted = new Set(ids);
    return mockProducts.filter((p) => wanted.has(p.id));
  },
  async getProductsByCategory(categorySlug) {
    const category = mockCategories.find((c) => c.slug === categorySlug);
    if (!category) return [];
    return mockProducts.filter((p) => p.categoryId === category.id);
  },
  async getRelatedProducts(product, limit = 4) {
    return mockProducts
      .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
      .slice(0, limit);
  },
  async getCategories() {
    return byCategoryOrder;
  },
  async getCategoryBySlug(slug) {
    return mockCategories.find((c) => c.slug === slug) ?? null;
  },
  async getCategoryById(id) {
    return mockCategories.find((c) => c.id === id) ?? null;
  },
  async getGalleryImages() {
    return mockGallery;
  },
  async getEditorialImages() {
    return mockEditorial;
  },
};
