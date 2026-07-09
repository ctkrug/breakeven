import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  breakevenTokens,
  maxTokensPerMonth,
  monthlyApiCost,
  monthlySelfHostCost,
} from "../src/model.js";

const positiveFloat = (max) =>
  fc.float({ min: Math.fround(0.01), max: Math.fround(max), noNaN: true });

describe("monthlyApiCost", () => {
  it("scales linearly with token volume", () => {
    expect(monthlyApiCost(1_000_000, 3)).toBe(3);
    expect(monthlyApiCost(10_000_000, 3)).toBe(30);
  });

  it("returns 0 for 0 tokens", () => {
    expect(monthlyApiCost(0, 3)).toBe(0);
  });

  it("never decreases as token volume grows, for any positive price", () => {
    fc.assert(
      fc.property(
        positiveFloat(1_000),
        positiveFloat(1e9),
        positiveFloat(1e9),
        (price, a, b) => {
          const [lo, hi] = a <= b ? [a, b] : [b, a];
          expect(monthlyApiCost(hi, price)).toBeGreaterThanOrEqual(
            monthlyApiCost(lo, price)
          );
        }
      )
    );
  });
});

describe("monthlySelfHostCost", () => {
  it("combines amortization and electricity", () => {
    const cost = monthlySelfHostCost({
      gpuPrice: 1600,
      lifetimeMonths: 24,
      powerDrawWatts: 350,
      hoursPerDay: 24,
      pricePerKwh: 0.15,
      utilization: 1,
    });
    // amortization: 1600 / 24 = 66.666...
    // electricity: 0.35kW * 24h * 30.44 * 0.15 = 38.3544
    expect(cost).toBeCloseTo(66.6667 + 38.3544, 2);
  });

  it("scales electricity down with utilization", () => {
    const full = monthlySelfHostCost({
      gpuPrice: 0,
      lifetimeMonths: 24,
      powerDrawWatts: 350,
      hoursPerDay: 24,
      pricePerKwh: 0.15,
      utilization: 1,
    });
    const half = monthlySelfHostCost({
      gpuPrice: 0,
      lifetimeMonths: 24,
      powerDrawWatts: 350,
      hoursPerDay: 24,
      pricePerKwh: 0.15,
      utilization: 0.5,
    });
    expect(half).toBeCloseTo(full / 2, 5);
  });
});

describe("maxTokensPerMonth", () => {
  it("multiplies throughput by available runtime", () => {
    const max = maxTokensPerMonth(100, 24, 1);
    expect(max).toBeCloseTo(100 * 24 * 3600 * 30.44, 0);
  });

  it("is always non-negative for non-negative inputs", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: Math.fround(1e6), noNaN: true }),
        fc.float({ min: 0, max: Math.fround(24), noNaN: true }),
        fc.float({ min: 0, max: Math.fround(1), noNaN: true }),
        (tokensPerSecond, hoursPerDay, utilization) => {
          expect(
            maxTokensPerMonth(tokensPerSecond, hoursPerDay, utilization)
          ).toBeGreaterThanOrEqual(0);
        }
      )
    );
  });
});

describe("breakevenTokens", () => {
  it("finds the volume where self-host cost equals API cost", () => {
    const tokens = breakevenTokens(100, 5);
    expect(monthlyApiCost(tokens, 5)).toBeCloseTo(100, 6);
  });

  it("returns Infinity when API price is zero", () => {
    expect(breakevenTokens(100, 0)).toBe(Infinity);
  });

  it("round-trips through monthlyApiCost for any positive cost and price", () => {
    fc.assert(
      fc.property(
        positiveFloat(1e6),
        positiveFloat(1_000),
        (selfHostCost, pricePerMillionTokens) => {
          const tokens = breakevenTokens(selfHostCost, pricePerMillionTokens);
          expect(monthlyApiCost(tokens, pricePerMillionTokens)).toBeCloseTo(
            selfHostCost,
            3
          );
        }
      )
    );
  });
});
