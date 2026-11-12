/**
 * DEVELOPMENT / TEST DATA — the store's taxonomy.
 *
 * Two levels, like most modern fashion stores: departments (Fabrics,
 * Clothing, Headwear & Wraps, Accessories) contain categories. Department and
 * category slugs share the /shop/[slug] URL space, so they must all be unique.
 */
import type { ProductCategory, ProductDepartment } from "@/lib/types";

export const mockDepartments: ProductDepartment[] = [
  {
    id: "dep-fabrics",
    name: "Fabrics",
    slug: "fabrics",
    tagline: "Printed, woven & embellished",
    description:
      "Ankara, Woven Kente, Isiagu, sequin prints and luxury lace.",
    imageUrl: "/images/ankara/1000259131-680x920.jpg",
    sortOrder: 1,
  },
  {
    id: "dep-clothing",
    name: "Clothing",
    slug: "clothing",
    tagline: "Ready to wear",
    description:
      "Finished gowns, kaftans and outfits for women and men, sewn and ready to wear.",
    imageUrl: "/images/luxury-lace/1000597840-680x920.jpg",
    sortOrder: 2,
  },
  {
    id: "dep-headwear",
    name: "Headwear & Wraps",
    slug: "headwear-and-wraps",
    tagline: "Gele, turbans & ipele",
    description:
      "Pre-tied auto gele, turbans and ipele shoulder wraps to finish the look.",
    sortOrder: 3,
  },
  {
    id: "dep-accessories",
    name: "Accessories",
    slug: "accessories",
    tagline: "Beads & finishing touches",
    description: "Beads and accessories to complete traditional and occasion outfits.",
    sortOrder: 4,
  },
];

export const mockCategories: ProductCategory[] = [
  // ── Fabrics ─────────────────────────────────────────────────────────
  {
    id: "cat-ankara",
    departmentId: "dep-fabrics",
    name: "Ankara",
    slug: "ankara",
    tagline: "Bold printed fabrics",
    description:
      "Graphic, colour-saturated African prints — from monochrome starbursts to botanical florals.",
    imageUrl: "/images/ankara/1000259131-680x920.jpg",
    sortOrder: 1,
  },
  {
    id: "cat-ankara-sequin",
    departmentId: "dep-fabrics",
    name: "Ankara Sequin",
    slug: "ankara-sequin",
    tagline: "Print meets sparkle",
    description: "Ankara prints overlaid with sequin embellishment.",
    imageUrl: "/images/ankara-sequin/1000527318-680x920.jpg",
    sortOrder: 2,
  },
  {
    id: "cat-woven-kente",
    departmentId: "dep-fabrics",
    name: "Woven Kente",
    slug: "woven-kente",
    tagline: "Hand-loom geometry",
    description:
      "Strip-woven cloth with metallic threads, shown as full cloths with coordinating folded pieces.",
    imageUrl: "/images/wooven-kente/1000294627-680x920.jpg",
    sortOrder: 3,
  },
  {
    id: "cat-isiagu",
    departmentId: "dep-fabrics",
    name: "Isiagu",
    slug: "isiagu",
    tagline: "Regal lion motifs",
    description:
      "Plush-finish Isiagu with gold-tone lion-head, tusk and crown motifs.",
    imageUrl: "/images/isiagu-fabric/1000536839-680x920.jpg",
    sortOrder: 4,
  },
  {
    id: "cat-luxury-lace",
    departmentId: "dep-fabrics",
    name: "Luxury Lace",
    slug: "luxury-lace",
    tagline: "Stonework & beading",
    description:
      "Embellished lace and beaded tulle for ceremonies and evening wear.",
    imageUrl: "/images/luxury-lace/1000258289-680x920.jpg",
    sortOrder: 5,
  },

  // ── Clothing ────────────────────────────────────────────────────────
  {
    id: "cat-womenswear",
    departmentId: "dep-clothing",
    name: "Womenswear",
    slug: "womenswear",
    tagline: "Gowns, dresses & sets",
    description:
      "Sewn gowns, dresses and two-pieces. Bust and waist measurements are listed where available.",
    imageUrl: "/images/luxury-lace/1000597840-680x920.jpg",
    sortOrder: 6,
  },
  {
    id: "cat-menswear",
    departmentId: "dep-clothing",
    name: "Menswear",
    slug: "menswear",
    tagline: "Kaftans, agbada & suits",
    description:
      "Sewn kaftans, agbada and native suits. Chest and trouser sizes are listed where available.",
    sortOrder: 7,
  },

  // ── Headwear & Wraps ────────────────────────────────────────────────
  {
    id: "cat-auto-gele",
    departmentId: "dep-headwear",
    name: "Auto Gele",
    slug: "auto-gele",
    tagline: "Pre-tied headwraps",
    description: "Ready-styled gele that sits perfectly in seconds — no tying needed.",
    sortOrder: 8,
  },
  {
    id: "cat-turbans",
    departmentId: "dep-headwear",
    name: "Turbans",
    slug: "turbans",
    tagline: "Easy statement headwear",
    description: "Pre-shaped turbans in prints, solids and embellished finishes.",
    sortOrder: 9,
  },
  {
    id: "cat-ipele",
    departmentId: "dep-headwear",
    name: "Ipele",
    slug: "ipele",
    tagline: "Shoulder wraps & sashes",
    description: "Ipele shoulder fabrics to drape and match with your gele.",
    sortOrder: 10,
  },

  // ── Accessories ─────────────────────────────────────────────────────
  {
    id: "cat-beads",
    departmentId: "dep-accessories",
    name: "Beads",
    slug: "beads",
    tagline: "Necklaces, bracelets & sets",
    description: "Traditional and occasion beads — necklaces, bracelets and full bridal sets.",
    sortOrder: 11,
  },
];
