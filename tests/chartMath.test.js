import { describe, expect, it } from "vitest";
import { buildSeries, linearScale, splitAtCeiling } from "../src/chartMath.js";

describe("linearScale", () => {
  it("maps domain endpoints to range endpoints", () => {
    const scale = linearScale([0, 100], [0, 500]);
    expect(scale(0)).toBe(0);
    expect(scale(100)).toBe(500);
    expect(scale(50)).toBe(250);
  });

  it("extrapolates outside the domain", () => {
    const scale = linearScale([0, 100], [0, 500]);
    expect(scale(200)).toBe(1000);
  });

  it("handles a zero-width domain without dividing by zero", () => {
    const scale = linearScale([10, 10], [0, 500]);
    expect(scale(10)).toBe(0);
    expect(Number.isFinite(scale(10))).toBe(true);
  });
});

describe("buildSeries", () => {
  it("produces steps + 1 evenly spaced points from 0 to tokensMax", () => {
    const series = buildSeries({
      tokensMax: 100_000_000,
      steps: 4,
      pricePerMillionTokens: 2,
      selfHostMonthlyCost: 100,
    });
    expect(series).toHaveLength(5);
    expect(series[0].tokens).toBe(0);
    expect(series.at(-1).tokens).toBe(100_000_000);
    expect(series[2].tokens).toBe(50_000_000);
  });

  it("computes a linear API cost and a flat self-host cost", () => {
    const series = buildSeries({
      tokensMax: 10_000_000,
      steps: 2,
      pricePerMillionTokens: 3,
      selfHostMonthlyCost: 50,
    });
    expect(series[1].apiCost).toBeCloseTo(15, 6);
    expect(series[2].apiCost).toBeCloseTo(30, 6);
    expect(series.every((p) => p.selfHostCost === 50)).toBe(true);
  });
});

describe("splitAtCeiling", () => {
  const series = buildSeries({
    tokensMax: 100,
    steps: 10,
    pricePerMillionTokens: 1,
    selfHostMonthlyCost: 10,
  });

  it("puts the whole series in solid when the ceiling is beyond the domain", () => {
    const { solid, dashed } = splitAtCeiling(series, 1000);
    expect(solid).toEqual(series);
    expect(dashed).toEqual([]);
  });

  it("puts the whole series in solid when the ceiling is Infinity", () => {
    const { solid, dashed } = splitAtCeiling(series, Infinity);
    expect(solid).toEqual(series);
    expect(dashed).toEqual([]);
  });

  it("splits mid-series and shares the boundary point", () => {
    const { solid, dashed } = splitAtCeiling(series, 55);
    expect(solid.at(-1).tokens).toBe(55);
    expect(dashed[0].tokens).toBe(55);
    expect(solid.at(-1)).toEqual(dashed[0]);
    // the boundary point is synthesized and appears in both segments
    expect(solid.length + dashed.length).toBe(series.length + 2);
  });

  it("puts everything in dashed when the ceiling is at or before the start", () => {
    const { solid, dashed } = splitAtCeiling(series, 0);
    expect(solid).toEqual([series[0]]);
    expect(dashed).toEqual(series);
  });
});
