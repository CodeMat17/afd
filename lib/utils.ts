export { cn } from "cn";

/** "A, B and C" — joins names for running copy. */
export function formatList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
