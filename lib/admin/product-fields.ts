/**
 * Which product fields apply to which category. Shared by the admin form
 * (to show only the relevant fields) and the save action (to enforce them),
 * so the two can't drift apart.
 */

export type SizeField =
  | "bust"
  | "waist"
  | "hips"
  | "dressLength"
  | "chest"
  | "shoulder"
  | "sleeve"
  | "topLength"
  | "trouser";

export interface ProductFieldRules {
  /** Fabrics are sold as cut pieces, so the piece length must be stated. */
  pieceLength: boolean;
  /** Garment measurements — only for sewn, ready-to-wear clothing. */
  sizes: SizeField[];
}

const WOMENSWEAR: SizeField[] = ["bust", "waist", "hips", "dressLength"];
const MENSWEAR: SizeField[] = ["chest", "shoulder", "sleeve", "topLength", "waist", "trouser"];

export function fieldRules(departmentSlug: string, categorySlug: string): ProductFieldRules {
  if (departmentSlug === "fabrics") return { pieceLength: true, sizes: [] };
  if (departmentSlug === "clothing") {
    if (categorySlug === "womenswear") return { pieceLength: false, sizes: WOMENSWEAR };
    if (categorySlug === "menswear") return { pieceLength: false, sizes: MENSWEAR };
    // A clothing category added later: offer every measurement.
    return { pieceLength: false, sizes: [...new Set([...WOMENSWEAR, ...MENSWEAR])] };
  }
  return { pieceLength: false, sizes: [] };
}

/** Display order on the product page: top to bottom of the body. */
export const SIZE_LABELS: Record<SizeField, string> = {
  bust: "Bust",
  chest: "Chest",
  shoulder: "Shoulder",
  sleeve: "Sleeve",
  topLength: "Top length",
  waist: "Waist",
  hips: "Hips",
  dressLength: "Dress length",
  trouser: "Trouser length",
};

/** "Ankara Gold Bloom" → "ankara-gold-bloom". Matches the slug rule in Convex. */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
