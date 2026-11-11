/**
 * Stock wording shared by the admin list, the stock history and the server
 * action, so labels and thresholds stay the same everywhere.
 */

/** At or below this many pieces a product is flagged as running low. */
export const LOW_STOCK = 3;

export type StockReason =
  | "initial"
  | "restock"
  | "sale"
  | "reversal"
  | "showroom_sale"
  | "return"
  | "damaged"
  | "count"
  | "correction";

export const REASON_LABELS: Record<StockReason, string> = {
  initial: "Opening stock",
  restock: "Restock received",
  sale: "Online sale",
  reversal: "Payment reversed",
  showroom_sale: "Showroom sale",
  return: "Customer return",
  damaged: "Damaged or lost",
  count: "Stock count",
  correction: "Correction",
};


export type StockStatus = "untracked" | "out" | "low" | "ok";

export function stockStatus(stockQuantity: string | null): StockStatus {
  if (stockQuantity === null) return "untracked";
  const n = Number(stockQuantity);
  if (n <= 0) return "out";
  if (n <= LOW_STOCK) return "low";
  return "ok";
}
