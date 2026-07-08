import { describe, expect, it } from "vitest";
import {
  breakevenTokens,
  maxTokensPerMonth,
  monthlyApiCost,
  monthlySelfHostCost,
} from "../src/model.js";

describe("monthlyApiCost", () => {
  it("scales linearly with token volume", () => {
    expect(monthlyApiCost(1_000_000, 3)).toBe(3);
    expect(monthlyApiCost(10_000_000, 3)).toBe(30);
  });

  it("returns 0 for 0 tokens", () => {
    expect(monthlyApiCost(0, 3)).toBe(0);
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
});

describe("breakevenTokens", () => {
  it("finds the volume where self-host cost equals API cost", () => {
    const tokens = breakevenTokens(100, 5);
    expect(monthlyApiCost(tokens, 5)).toBeCloseTo(100, 6);
  });

  it("returns Infinity when API price is zero", () => {
    expect(breakevenTokens(100, 0)).toBe(Infinity);
  });
});
