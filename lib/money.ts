/**
 * Decimal-safe money and quantity helpers.
 *
 * Prices are stored in cents and quantities in thousandths, both as BigInt,
 * so no authoritative calculation ever touches floating point.
 */

const DECIMAL_PATTERN = /^\d+(\.\d+)?$/;
const QTY_SCALE = 3;

export function isDecimalString(value: string): boolean {
  return DECIMAL_PATTERN.test(value.trim());
}

/** Parse a non-negative decimal string into an integer scaled by 10^scale. */
function toScaled(value: string, scale: number): bigint {
  const trimmed = value.trim();
  if (!isDecimalString(trimmed)) {
    throw new Error(`Invalid decimal value: "${value}"`);
  }
  const [whole, fraction = ""] = trimmed.split(".");
  const padded = (fraction + "0".repeat(scale + 1)).slice(0, scale + 1);
  const raw = BigInt(whole + padded.slice(0, scale));
  // Round half up on the first dropped digit.
  return Number(padded[scale]) >= 5 ? raw + BigInt(1) : raw;
}

function fromScaled(value: bigint, scale: number): string {
  const negative = value < BigInt(0);
  const abs = negative ? -value : value;
  const str = abs.toString().padStart(scale + 1, "0");
  const whole = str.slice(0, str.length - scale);
  const fraction = str.slice(str.length - scale).replace(/0+$/, "");
  return `${negative ? "-" : ""}${whole}${fraction ? `.${fraction}` : ""}`;
}

export const toCents = (price: string): bigint => toScaled(price, 2);
export const toQty = (quantity: string): bigint => toScaled(quantity, QTY_SCALE);
export const qtyToString = (quantity: bigint): string =>
  fromScaled(quantity, QTY_SCALE);

/** price × quantity, rounded half up to the nearest cent. */
export function lineTotalCents(price: string, quantity: string): bigint {
  const product = toCents(price) * toQty(quantity);
  const divisor = BigInt(10 ** QTY_SCALE);
  const half = divisor / BigInt(2);
  return (product + half) / divisor;
}

export function sumCents(values: bigint[]): bigint {
  return values.reduce((total, value) => total + value, BigInt(0));
}

export function formatCents(cents: bigint): string {
  const negative = cents < BigInt(0);
  const abs = negative ? -cents : cents;
  const dollars = abs / BigInt(100);
  const remainder = (abs % BigInt(100)).toString().padStart(2, "0");
  return `${negative ? "-" : ""}$${dollars.toLocaleString("en-US")}.${remainder}`;
}

export function formatPrice(price: string): string {
  return formatCents(toCents(price));
}

export function compareDecimal(a: string, b: string): number {
  const diff = toCents(a) - toCents(b);
  return diff === BigInt(0) ? 0 : diff > BigInt(0) ? 1 : -1;
}

/**
 * Snap a quantity onto the product's valid increments: never below the
 * minimum, always minimum + n × step.
 */
export function normaliseQuantity(
  quantity: string,
  minimum: string,
  step: string,
): string {
  const min = toQty(minimum);
  const inc = toQty(step) > BigInt(0) ? toQty(step) : BigInt(1);
  let qty: bigint;
  try {
    qty = toQty(quantity);
  } catch {
    return qtyToString(min);
  }
  if (qty <= min) return qtyToString(min);
  const steps = (qty - min + inc / BigInt(2)) / inc;
  return qtyToString(min + steps * inc);
}

export function stepQuantity(
  quantity: string,
  minimum: string,
  step: string,
  direction: 1 | -1,
): string {
  const current = toQty(normaliseQuantity(quantity, minimum, step));
  const next = current + BigInt(direction) * toQty(step);
  return normaliseQuantity(
    qtyToString(next < BigInt(0) ? BigInt(0) : next),
    minimum,
    step,
  );
}

export function isAtMinimum(quantity: string, minimum: string): boolean {
  return toQty(quantity) <= toQty(minimum);
}

export function addQuantities(a: string, b: string): string {
  return qtyToString(toQty(a) + toQty(b));
}

export function sumQuantities(values: string[]): string {
  return qtyToString(
    values.reduce((total, value) => total + toQty(value), BigInt(0)),
  );
}
