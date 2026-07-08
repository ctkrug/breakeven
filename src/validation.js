/**
 * Inline input validation. Each function returns { valid, error } instead of
 * throwing, so a caller can render the error next to the field and keep
 * showing the last valid chart state rather than a blank/NaN render.
 */

function numeric(value) {
  if (typeof value === "string" && value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function validateTokensPerMonth(value) {
  const n = numeric(value);
  if (n === null) return { valid: false, error: "Enter a number." };
  if (n < 0) return { valid: false, error: "Token volume can't be negative." };
  return { valid: true, error: null, value: n };
}

export function validatePrice(value, label = "Price") {
  const n = numeric(value);
  if (n === null) return { valid: false, error: "Enter a number." };
  if (n <= 0)
    return { valid: false, error: `${label} must be greater than zero.` };
  return { valid: true, error: null, value: n };
}

export function validateUtilizationPercent(value) {
  const n = numeric(value);
  if (n === null) return { valid: false, error: "Enter a number." };
  if (n < 0 || n > 100) {
    return { valid: false, error: "Utilization must be between 0 and 100." };
  }
  return { valid: true, error: null, value: n / 100 };
}

export function validateLifetimeMonths(value) {
  const n = numeric(value);
  if (n === null) return { valid: false, error: "Enter a number." };
  if (n <= 0)
    return {
      valid: false,
      error: "Lifetime must be greater than zero months.",
    };
  return { valid: true, error: null, value: n };
}
