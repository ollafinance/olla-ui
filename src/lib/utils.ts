import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitizes a numeric input string to only allow valid decimal numbers
 * - Removes all non-numeric characters except decimal point
 * - Prevents multiple decimal points (keeps only the first one)
 * - Limits to specified number of decimal places (default: 6)
 * - Allows leading zeros
 * 
 * @param value - The input string to sanitize
 * @param maxDecimals - Maximum number of decimal places (default: 6)
 * @returns The sanitized numeric string
 * 
 * @example
 * sanitizeNumericInput("abc12.34.56xyz") // returns "12.3456"
 * sanitizeNumericInput("0.1234567", 6) // returns "0.123456"
 * sanitizeNumericInput("00.5") // returns "00.5"
 */
export function sanitizeNumericInput(value: string, maxDecimals: number = 6): string {
  // Remove all non-numeric characters except decimal point
  let sanitized = value.replace(/[^0-9.]/g, '');
  
  // Prevent multiple decimal points - keep only the first one
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    sanitized = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limit to max decimal places
  if (parts.length === 2 && parts[1].length > maxDecimals) {
    sanitized = parts[0] + '.' + parts[1].slice(0, maxDecimals);
  }
  
  return sanitized;
}
