import { describe, expect, it } from "vitest";
import {
  validateLifetimeMonths,
  validatePrice,
  validateTokensPerMonth,
  validateUtilizationPercent,
} from "../src/validation.js";

describe("validateTokensPerMonth", () => {
  it("accepts zero and positive values", () => {
    expect(validateTokensPerMonth(0)).toMatchObject({ valid: true, value: 0 });
    expect(validateTokensPerMonth(1000)).toMatchObject({
      valid: true,
      value: 1000,
    });
  });

  it("rejects negative values", () => {
    const result = validateTokensPerMonth(-1);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/negative/);
  });

  it("rejects non-numeric input", () => {
    expect(validateTokensPerMonth("abc").valid).toBe(false);
    expect(validateTokensPerMonth("").valid).toBe(false);
  });

  it("rejects whitespace, emoji, and non-finite input", () => {
    expect(validateTokensPerMonth("   ").valid).toBe(false);
    expect(validateTokensPerMonth("🚀").valid).toBe(false);
    expect(validateTokensPerMonth("NaN").valid).toBe(false);
    expect(validateTokensPerMonth("Infinity").valid).toBe(false);
    expect(validateTokensPerMonth(NaN).valid).toBe(false);
    expect(validateTokensPerMonth(Infinity).valid).toBe(false);
  });
});

describe("validatePrice", () => {
  it("accepts positive values", () => {
    expect(validatePrice(0.15)).toMatchObject({ valid: true, value: 0.15 });
  });

  it("rejects zero and negative values", () => {
    expect(validatePrice(0).valid).toBe(false);
    expect(validatePrice(-5).valid).toBe(false);
  });

  it("includes the given label in the error message", () => {
    const result = validatePrice(0, "Electricity price");
    expect(result.error).toMatch(/Electricity price/);
  });

  it("rejects non-numeric, whitespace, and non-finite input", () => {
    expect(validatePrice("abc").valid).toBe(false);
    expect(validatePrice("   ").valid).toBe(false);
    expect(validatePrice("🚀").valid).toBe(false);
    expect(validatePrice("NaN").valid).toBe(false);
    expect(validatePrice("Infinity").valid).toBe(false);
    expect(validatePrice(NaN).valid).toBe(false);
    expect(validatePrice(Infinity).valid).toBe(false);
  });
});

describe("validateUtilizationPercent", () => {
  it("accepts the 0-100 boundary inclusive and converts to a 0-1 fraction", () => {
    expect(validateUtilizationPercent(0)).toMatchObject({
      valid: true,
      value: 0,
    });
    expect(validateUtilizationPercent(100)).toMatchObject({
      valid: true,
      value: 1,
    });
    expect(validateUtilizationPercent(70)).toMatchObject({
      valid: true,
      value: 0.7,
    });
  });

  it("rejects values outside 0-100", () => {
    expect(validateUtilizationPercent(-1).valid).toBe(false);
    expect(validateUtilizationPercent(101).valid).toBe(false);
  });

  it("rejects non-numeric and non-finite input", () => {
    expect(validateUtilizationPercent("abc").valid).toBe(false);
    expect(validateUtilizationPercent("   ").valid).toBe(false);
    expect(validateUtilizationPercent("🚀").valid).toBe(false);
    expect(validateUtilizationPercent(NaN).valid).toBe(false);
    expect(validateUtilizationPercent(Infinity).valid).toBe(false);
  });
});

describe("validateLifetimeMonths", () => {
  it("accepts positive values", () => {
    expect(validateLifetimeMonths(24)).toMatchObject({
      valid: true,
      value: 24,
    });
  });

  it("rejects zero and negative values", () => {
    expect(validateLifetimeMonths(0).valid).toBe(false);
    expect(validateLifetimeMonths(-12).valid).toBe(false);
  });

  it("rejects non-numeric and non-finite input", () => {
    expect(validateLifetimeMonths("abc").valid).toBe(false);
    expect(validateLifetimeMonths("   ").valid).toBe(false);
    expect(validateLifetimeMonths("🚀").valid).toBe(false);
    expect(validateLifetimeMonths(NaN).valid).toBe(false);
    expect(validateLifetimeMonths(Infinity).valid).toBe(false);
  });
});
