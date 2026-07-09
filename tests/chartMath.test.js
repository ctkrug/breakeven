import fc from "fast-check";
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

  it("always maps both domain endpoints exactly onto the range endpoints", () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(-1e6), max: Math.fround(1e6), noNaN: true }),
        fc.float({ min: Math.fround(-1e6), max: Math.fround(1e6), noNaN: true }),
        fc.float({ min: Math.fround(-1e3), max: Math.fround(1e3), noNaN: true }),
        fc.float({ min: Math.fround(-1e3), max: Math.fround(1e3), noNaN: true }),
        (d0, d1, r0, r1) => {
          fc.pre(d0 !== d1);
          const scale = linearScale([d0, d1], [r0, r1]);
          expect(scale(d0)).toBeCloseTo(r0, 3);
          expect(scale(d1)).toBeCloseTo(r1, 3);
        }
      )
    );
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

  it("solid always ends where dashed begins, for any ceiling", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: Math.fround(500), noNaN: true }),
        (ceilingTokens) => {
          const { solid, dashed } = splitAtCeiling(series, ceilingTokens);
          expect(solid.length).toBeGreaterThan(0);
          if (dashed.length > 0) {
            expect(solid.at(-1)).toEqual(dashed[0]);
          }
          // tokens never decrease across the reconstructed line
          const allTokens = [...solid, ...dashed].map((p) => p.tokens);
          for (let i = 1; i < allTokens.length; i++) {
            expect(allTokens[i]).toBeGreaterThanOrEqual(allTokens[i - 1]);
          }
        }
      )
    );
  });
});
