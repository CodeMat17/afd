import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Money is stored as integer-cent strings and quantities as decimal strings,
 * matching `lib/money.ts`, so nothing authoritative passes through floats.
 */
export const orderStatus = v.union(
  v.literal("pending"),
  v.literal("paid"),
  v.literal("failed"),
  v.literal("reversed"),
);

export const fulfilment = v.union(v.literal("pickup"), v.literal("delivery"));

export const orderItem = v.object({
  productId: v.string(),
  sku: v.string(),
  name: v.string(),
  unit: v.string(),
  unitPrice: v.string(),
  quantity: v.string(),
  lineTotalCents: v.string(),
});

export const address = v.object({
  line1: v.string(),
  line2: v.optional(v.string()),
  city: v.string(),
  region: v.optional(v.string()),
  postalCode: v.optional(v.string()),
  country: v.string(),
});

/**
 * A photo hosted on Cloudinary. Convex keeps only the reference: the public
 * ID (for deletes and transforms), the delivery URL and the dimensions.
 */
export const cloudImage = v.object({
  publicId: v.string(),
  url: v.string(),
  width: v.number(),
  height: v.number(),
});

export const productImage = v.object({
  publicId: v.string(),
  url: v.string(),
  width: v.number(),
  height: v.number(),
  altText: v.string(),
});

export const productUnit = v.union(v.literal("piece"), v.literal("metre"), v.literal("yard"));

export const productDetails = v.object({
  material: v.optional(v.string()),
  width: v.optional(v.string()),
  care: v.optional(v.string()),
  patternNotes: v.optional(v.string()),
  pieceLength: v.optional(v.string()),
});

export const garmentSizes = v.object({
  bust: v.optional(v.string()),
  waist: v.optional(v.string()),
  chest: v.optional(v.string()),
  /** Trouser length. Key kept as "trouser" so existing products still read. */
  trouser: v.optional(v.string()),
  hips: v.optional(v.string()),
  dressLength: v.optional(v.string()),
  shoulder: v.optional(v.string()),
  sleeve: v.optional(v.string()),
  topLength: v.optional(v.string()),
});

export const galleryKind = v.union(v.literal("gallery"), v.literal("editorial"));

/** Editable product fields; shared by the admin mutation and the seed. */
export const productFields = {
  slug: v.string(),
  sku: v.string(),
  name: v.string(),
  description: v.string(),
  /** Decimal string, e.g. "6.50". */
  price: v.string(),
  unit: productUnit,
  minimumQuantity: v.string(),
  quantityStep: v.string(),
  stockQuantity: v.union(v.string(), v.null()),
  isAvailable: v.boolean(),
  isFeatured: v.boolean(),
  colours: v.array(v.string()),
  details: productDetails,
  sizes: v.optional(garmentSizes),
  /** In display order; the first image is the primary one. */
  images: v.array(productImage),
};

/**
 * What the admin may send with a product save: everything but the SKU, which
 * the server assigns, and the stock level, which only changes through
 * `stock.adjust` and sales, so every change is recorded in `stockMovements`.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { sku: _assignedSku, stockQuantity: _managedStock, ...adminProductFields } = productFields;
export { adminProductFields };

/** Why a product's stock level changed. */
export const stockReason = v.union(
  /** Opening stock entered when the product was created. */
  v.literal("initial"),
  /** New pieces received from a supplier or the workshop. */
  v.literal("restock"),
  /** Paid online order (automatic). */
  v.literal("sale"),
  /** A paid online order was reversed; its pieces go back on the shelf (automatic). */
  v.literal("reversal"),
  /** Sold in person at the showroom. */
  v.literal("showroom_sale"),
  /** A customer brought pieces back. */
  v.literal("return"),
  /** Damaged, lost or written off. */
  v.literal("damaged"),
  /** A physical stock count replaced the recorded level. */
  v.literal("count"),
  /** Fixing a mistake. */
  v.literal("correction"),
);

export default defineSchema({
  departments: defineTable({
    slug: v.string(),
    name: v.string(),
    tagline: v.string(),
    description: v.string(),
    image: v.optional(cloudImage),
    sortOrder: v.number(),
  }).index("by_slug", ["slug"]),

  categories: defineTable({
    departmentId: v.id("departments"),
    slug: v.string(),
    name: v.string(),
    tagline: v.string(),
    description: v.optional(v.string()),
    image: v.optional(cloudImage),
    sortOrder: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_department", ["departmentId"]),

  products: defineTable({
    categoryId: v.id("categories"),
    ...productFields,
    /** ISO date used for "newest" sorting. */
    createdAt: v.string(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_sku", ["sku"])
    .index("by_category", ["categoryId"]),

  /** The /gallery page and the home page editorial imagery. */
  galleryImages: defineTable({
    kind: galleryKind,
    image: cloudImage,
    altText: v.string(),
    caption: v.string(),
    productSlug: v.optional(v.string()),
    sortOrder: v.number(),
  })
    .index("by_kind", ["kind", "sortOrder"])
    .index("by_kind_publicId", ["kind", "image.publicId"]),

  /**
   * Failed admin sign-ins, counted per fixed window (convex/loginAttempts.ts).
   * Keys are "global" or "ip:<HMAC of the IP>"; raw IPs are never stored.
   */
  loginAttempts: defineTable({
    key: v.string(),
    count: v.number(),
    windowStart: v.number(),
  }).index("by_key", ["key"]),

  /**
   * Guest shopping carts. The browser holds only the random `cartId` (in an
   * httpOnly cookie); names, prices and photos are always read live from
   * `products`, never stored here.
   */
  carts: defineTable({
    cartId: v.string(),
    items: v.array(v.object({ productId: v.id("products"), quantity: v.string() })),
    updatedAt: v.number(),
  }).index("by_cartId", ["cartId"]),

  /**
   * Every change to a product's stock level. `change` is signed; `balance` is
   * the level after it. Pieces are whole numbers.
   */
  stockMovements: defineTable({
    productId: v.id("products"),
    change: v.number(),
    balance: v.number(),
    reason: stockReason,
    note: v.optional(v.string()),
    orderNumber: v.optional(v.string()),
    /**
     * Set on a sale that needed more pieces than were recorded (e.g. two
     * customers paid for the last piece at once). The level stops at 0.
     */
    shortfall: v.optional(v.number()),
  }).index("by_product", ["productId"]),

  /**
   * Single row (key "home"): the photos in the home page hero, chosen in
   * /admin/hero. Kept apart from products so the hero only changes when the
   * admin saves it there.
   */
  hero: defineTable({
    key: v.literal("home"),
    images: v.array(cloudImage),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  /**
   * Single row (key "site"): the showroom's phone, WhatsApp and email, edited
   * from /admin/settings and shown everywhere on the storefront.
   */
  contact: defineTable({
    key: v.literal("site"),
    /** As displayed, e.g. "+254 710 660 524". */
    phone: v.string(),
    /** As displayed; links use the digits only. */
    whatsapp: v.string(),
    email: v.string(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  /** Single row (key "checkout") edited from /admin/settings. */
  settings: defineTable({
    key: v.literal("checkout"),
    taxRateBps: v.number(),
    shippingFeeCents: v.string(),
    shippingFeeIsPlaceholder: v.boolean(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  orders: defineTable({
    orderNumber: v.string(),
    status: orderStatus,
    currency: v.literal("USD"),

    fullName: v.string(),
    email: v.string(),
    phone: v.string(),
    fulfilment,
    address: v.optional(address),
    notes: v.optional(v.string()),

    taxDeclared: v.boolean(),
    taxId: v.optional(v.string()),
    taxRateBps: v.number(),

    items: v.array(orderItem),
    subtotalCents: v.string(),
    taxCents: v.string(),
    shippingCents: v.string(),
    totalCents: v.string(),

    pesapalTrackingId: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    paymentDescription: v.optional(v.string()),
    confirmationCode: v.optional(v.string()),
    paidAmount: v.optional(v.string()),
    paidAt: v.optional(v.number()),
    /** True while this order's pieces are taken off the stock levels. */
    stockDeducted: v.optional(v.boolean()),
    /** When the "order confirmed" email went to the customer. */
    confirmationEmailedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_orderNumber", ["orderNumber"])
    .index("by_trackingId", ["pesapalTrackingId"])
    // Customer order history (emails are stored lowercased).
    .index("by_email", ["email"]),
});
