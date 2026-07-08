import { describe, expect, it } from "vitest";
import { decodeScenario, encodeScenario } from "../src/urlState.js";

const DEFAULTS = {
  tokensPerMonth: 20_000_000,
  gpuId: "rtx4090",
  apiPriceId: "gpt-4o-mini",
  customApiPrice: null,
  pricePerKwh: 0.15,
  utilizationPercent: 70,
  lifetimeMonths: 24,
};

const VALID = {
  gpuIds: ["rtx3090", "rtx4090", "a100-80gb"],
  apiPriceIds: ["gpt-4o-mini", "claude-haiku"],
};

describe("encodeScenario / decodeScenario round trip", () => {
  it("reproduces a full scenario with a reference API price", () => {
    const scenario = {
      tokensPerMonth: 42_000_000,
      gpuId: "a100-80gb",
      apiPriceId: "claude-haiku",
      customApiPrice: null,
      pricePerKwh: 0.22,
      utilizationPercent: 55,
      lifetimeMonths: 36,
    };
    const decoded = decodeScenario(encodeScenario(scenario), DEFAULTS, VALID);
    expect(decoded).toMatchObject({
      tokensPerMonth: 42_000_000,
      gpuId: "a100-80gb",
      apiPriceId: "claude-haiku",
      pricePerKwh: 0.22,
      utilizationPercent: 55,
      lifetimeMonths: 36,
    });
  });

  it("reproduces a scenario with a custom API price override", () => {
    const scenario = { ...DEFAULTS, customApiPrice: 3.5, apiPriceId: null };
    const decoded = decodeScenario(encodeScenario(scenario), DEFAULTS, VALID);
    expect(decoded.customApiPrice).toBe(3.5);
    expect(decoded.apiPriceId).toBe(null);
  });
});

describe("decodeScenario with no query string", () => {
  it("falls back to the provided defaults", () => {
    expect(decodeScenario("", DEFAULTS, VALID)).toEqual(DEFAULTS);
  });
});

describe("decodeScenario with invalid values", () => {
  it("falls back per-field instead of rejecting the whole scenario", () => {
    const decoded = decodeScenario(
      "tokens=-5&gpu=unknown-gpu&util=200&kwh=0&life=-1",
      DEFAULTS,
      VALID
    );
    expect(decoded.tokensPerMonth).toBe(DEFAULTS.tokensPerMonth);
    expect(decoded.gpuId).toBe(DEFAULTS.gpuId);
    expect(decoded.utilizationPercent).toBe(DEFAULTS.utilizationPercent);
    expect(decoded.pricePerKwh).toBe(DEFAULTS.pricePerKwh);
    expect(decoded.lifetimeMonths).toBe(DEFAULTS.lifetimeMonths);
  });

  it("accepts a valid gpu id alongside an invalid api id", () => {
    const decoded = decodeScenario("gpu=rtx3090&api=nope", DEFAULTS, VALID);
    expect(decoded.gpuId).toBe("rtx3090");
    expect(decoded.apiPriceId).toBe(DEFAULTS.apiPriceId);
  });
});
