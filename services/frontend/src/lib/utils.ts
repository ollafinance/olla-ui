import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { parseUnits, formatUnits } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fixed-point scale used for all currency arithmetic — matches viem's wei convention.
export const SCALE_DECIMALS = 18;
const SCALE_BIGINT = 10n ** BigInt(SCALE_DECIMALS);

/**
 * Parses a decimal string or number into a fixed-point bigint scaled by 10^18.
 * Returns 0n for invalid/empty/non-positive input. Values with more than 18
 * decimal places are truncated (not rounded) to fit the scale.
 */
export function toScaledBigInt(value: string | number | null | undefined): bigint {
  if (value === null || value === undefined) return 0n;
  let s: string;
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) return 0n;
    s = toPlainDecimal(value, SCALE_DECIMALS);
  } else {
    s = value.trim();
  }
  if (!s || s === "." || s === "-") return 0n;
  // Truncate excess decimal places so parseUnits doesn't throw.
  const [int, frac = ""] = s.split(".");
  const safe = frac.length > SCALE_DECIMALS ? `${int}.${frac.slice(0, SCALE_DECIMALS)}` : s;
  try {
    const n = parseUnits(safe, SCALE_DECIMALS);
    return n < 0n ? 0n : n;
  } catch {
    return 0n;
  }
}

/**
 * Formats a fixed-point scaled bigint back into a decimal string with the
 * requested number of display decimals. Trailing zeros and dangling decimal
 * points are trimmed. Never emits scientific notation.
 */
export function fromScaledBigInt(value: bigint, displayDecimals: number = 2): string {
  if (value <= 0n) return "0";
  const full = formatUnits(value, SCALE_DECIMALS);
  const [intPart, fracPart = ""] = full.split(".");
  if (displayDecimals <= 0) return intPart;
  const truncatedFrac = fracPart.slice(0, displayDecimals);
  const joined = truncatedFrac ? `${intPart}.${truncatedFrac}` : intPart;
  return joined.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

/** Multiply two SCALE_DECIMALS-scaled bigints, returning a SCALE_DECIMALS-scaled result. */
export function mulScaled(a: bigint, b: bigint): bigint {
  return (a * b) / SCALE_BIGINT;
}

/** Divide two SCALE_DECIMALS-scaled bigints, returning a SCALE_DECIMALS-scaled result. */
export function divScaled(a: bigint, b: bigint): bigint {
  if (b === 0n) return 0n;
  return (a * SCALE_BIGINT) / b;
}

/**
 * Formats a Number with fixed decimals, avoiding scientific notation for very
 * large/small values. Native `toFixed` flips to sci at magnitudes ≥ 1e21.
 */
export function toPlainDecimal(n: number, decimals: number): string {
  if (!Number.isFinite(n)) return "0";
  const fixed = n.toFixed(decimals);
  if (!/e/i.test(fixed)) return fixed;
  return n.toLocaleString("en-US", {
    useGrouping: false,
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Sanitizes a numeric input string: strips non-digit/decimal chars, keeps only
 * the first decimal point, caps decimal places at `maxDecimals`, and caps
 * overall length at `maxLength`.
 */
export function sanitizeNumericInput(
  value: string,
  maxDecimals: number = 6,
  maxLength: number = 22
): string {
  // Remove all non-numeric characters except decimal point
  let sanitized = value.replace(/[^0-9.]/g, "");

  // Prevent multiple decimal points - keep only the first one
  const parts = sanitized.split(".");
  if (parts.length > 2) {
    sanitized = parts[0] + "." + parts.slice(1).join("");
  }

  // Limit to max decimal places
  if (parts.length === 2 && parts[1].length > maxDecimals) {
    sanitized = parts[0] + "." + parts[1].slice(0, maxDecimals);
  }

  // Cap total length to avoid unreadable/overflowing values
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
}

/**
 * Returns a Tailwind class for large amount displays that shrinks text based
 * on character count and screen size. Pass the full visible string (including
 * any "$" prefix) so prefix length participates in the bucket decision.
 *
 * Breakpoint note: the layout stacks below `lg` (1024px), so `md` has the
 * widest card (full-width); `lg` snaps back to 551px.
 */
export function getAmountSizeClass(
  value: string,
  variant: "staking" | "withdraw" | "compact"
): string {
  const len = (value || "").length;
  if (variant === "staking") {
    if (len <= 8) return "text-4xl sm:text-5xl md:text-[60px] lg:text-[50px]";
    if (len <= 12) return "text-3xl sm:text-[42px] md:text-[60px] lg:text-[50px]";
    return "text-2xl sm:text-[36px] md:text-[60px] lg:text-[44px]";
  }
  if (variant === "withdraw") {
    if (len <= 8) return "text-3xl sm:text-[40px] md:text-[50px] lg:text-[42px]";
    if (len <= 12) return "text-2xl sm:text-[34px] md:text-[50px] lg:text-[42px]";
    if (len <= 16) return "text-xl sm:text-[30px] md:text-[50px] lg:text-[42px]";
    return "text-lg sm:text-2xl md:text-[40px] lg:text-[42px]";
  }
  // compact: small preview/return cards. Below `lg` the cards stack full-width
  // and have room for the bigger size; at `lg` the right column is only 344px
  // so we step down one notch.
  if (len <= 10) return "text-[26px] lg:text-[24px]";
  if (len <= 14) return "text-[24px] lg:text-[22px]";
  if (len <= 18) return "text-[22px] lg:text-[20px]";
  if (len <= 22) return "text-[20px] lg:text-[18px]";
  return "text-[18px] lg:text-[16px]";
}

