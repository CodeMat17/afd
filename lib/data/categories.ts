/**
 * DEVELOPMENT / TEST DATA — seed categories built from the supplied image
 * folders in /public/images. Edit freely; the UI has no category-specific logic.
 */
import type { ProductCategory } from "@/lib/types";

export const mockCategories: ProductCategory[] = [
  {
    id: "cat-ankara",
    name: "Ankara",
    slug: "ankara",
    tagline: "Bold printed fabrics",
    description:
      "Graphic, colour-saturated African prints — from monochrome starbursts to botanical florals.",
    imageUrl: "/images/ankara/1000259131-680x920.jpg",
    sortOrder: 1,
  },
  {
    id: "cat-woven-kente",
    name: "Woven Kente",
    slug: "woven-kente",
    tagline: "Hand-loom geometry",
    description:
      "Strip-woven cloth with metallic threads, shown as full cloths with coordinating folded pieces.",
    imageUrl: "/images/wooven-kente/1000294627-680x920.jpg",
    sortOrder: 2,
  },
  {
    id: "cat-luxury-lace",
    name: "Luxury Lace",
    slug: "luxury-lace",
    tagline: "Stonework & beading",
    description:
      "Embellished lace and beaded tulle for ceremonies and evening wear.",
    imageUrl: "/images/luxury-lace/1000258289-680x920.jpg",
    sortOrder: 3,
  },
  {
    id: "cat-isiagu",
    name: "Isiagu Fabric",
    slug: "isiagu-fabric",
    tagline: "Regal lion motifs",
    description:
      "Plush-finish Isiagu with gold-tone lion-head, tusk and crown motifs.",
    imageUrl: "/images/isiagu-fabric/1000536839-680x920.jpg",
    sortOrder: 4,
  },
  {
    id: "cat-ankara-sequin",
    name: "Ankara Sequin",
    slug: "ankara-sequin",
    tagline: "Print meets sparkle",
    description: "Ankara prints overlaid with sequin embellishment.",
    imageUrl: "/images/ankara-sequin/1000527318-680x920.jpg",
    sortOrder: 5,
  },
];
