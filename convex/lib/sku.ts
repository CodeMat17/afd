/**
 * SKUs are assigned automatically as PREFIX-NNNN, e.g. ANK-1015.
 *
 * The prefix belongs to the category: the one its products already use
 * (so the starter ANK / KEN / LAC / ISI / SEQ codes carry on), otherwise
 * three letters from the category name. The number is one more than the
 * highest number any product has under that prefix, starting at 1001, so
 * codes stay unique even when two categories end up sharing a prefix.
 *
 * Pure and dependency-free: used by the Convex mutation that assigns the
 * SKU and by the admin page that previews it.
 */

const SKU = /^([A-Z]{2,5})-(\d+)$/;
const FIRST_NUMBER = 1001;

interface SkuProduct {
  sku: string;
  categoryId: string;
}

export function prefixFromName(name: string): string {
  const words = name
    .normalize("NFD")
    .replace(/[^A-Za-z\s]/g, "")
    .toUpperCase()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "PRD";
  const code =
    words.length === 1 ? words[0].slice(0, 3) : words[0][0] + words[words.length - 1].slice(0, 2);
  return code.padEnd(3, "X");
}

export function categoryPrefix(
  category: { id: string; name: string },
  products: readonly SkuProduct[],
): string {
  const counts = new Map<string, number>();
  for (const p of products) {
    if (p.categoryId !== category.id) continue;
    const match = SKU.exec(p.sku);
    if (match) counts.set(match[1], (counts.get(match[1]) ?? 0) + 1);
  }
  let best: string | undefined;
  for (const [prefix, count] of counts) if (!best || count > counts.get(best)!) best = prefix;
  return best ?? prefixFromName(category.name);
}

export function nextSku(
  category: { id: string; name: string },
  products: readonly SkuProduct[],
): string {
  const prefix = categoryPrefix(category, products);
  let highest = FIRST_NUMBER - 1;
  for (const p of products) {
    const match = SKU.exec(p.sku);
    if (match && match[1] === prefix) highest = Math.max(highest, Number(match[2]));
  }
  return `${prefix}-${String(highest + 1).padStart(4, "0")}`;
}
