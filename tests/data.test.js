import { describe, expect, it } from "vitest";
import {
  API_PRICE_CATALOG,
  DEFAULT_ASSUMPTIONS,
  GPU_CATALOG,
} from "../src/data.js";

describe("GPU_CATALOG", () => {
  it("has at least four entries", () => {
    expect(GPU_CATALOG.length).toBeGreaterThanOrEqual(4);
  });

  it("mixes consumer and datacenter categories", () => {
    const categories = new Set(GPU_CATALOG.map((g) => g.category));
    expect(categories.has("consumer")).toBe(true);
    expect(categories.has("datacenter")).toBe(true);
  });

  it("every entry has documented price, power, throughput, and a source note", () => {
    for (const gpu of GPU_CATALOG) {
      expect(gpu.id).toBeTruthy();
      expect(gpu.name).toBeTruthy();
      expect(gpu.gpuPrice).toBeGreaterThan(0);
      expect(gpu.powerDrawWatts).toBeGreaterThan(0);
      expect(gpu.tokensPerSecond).toBeGreaterThan(0);
      expect(gpu.note.length).toBeGreaterThan(10);
    }
  });

  it("has unique ids", () => {
    const ids = GPU_CATALOG.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("API_PRICE_CATALOG", () => {
  it("has at least one reference price", () => {
    expect(API_PRICE_CATALOG.length).toBeGreaterThan(0);
  });

  it("every entry has a positive price and a documented basis", () => {
    for (const entry of API_PRICE_CATALOG) {
      expect(entry.id).toBeTruthy();
      expect(entry.name).toBeTruthy();
      expect(entry.pricePerMillionTokens).toBeGreaterThan(0);
      expect(entry.note.length).toBeGreaterThan(10);
    }
  });

  it("has unique ids", () => {
    const ids = API_PRICE_CATALOG.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("DEFAULT_ASSUMPTIONS", () => {
  it("has sane, in-range defaults", () => {
    expect(DEFAULT_ASSUMPTIONS.pricePerKwh).toBeGreaterThan(0);
    expect(DEFAULT_ASSUMPTIONS.utilization).toBeGreaterThan(0);
    expect(DEFAULT_ASSUMPTIONS.utilization).toBeLessThanOrEqual(1);
    expect(DEFAULT_ASSUMPTIONS.lifetimeMonths).toBeGreaterThan(0);
    expect(DEFAULT_ASSUMPTIONS.hoursPerDay).toBeGreaterThan(0);
    expect(DEFAULT_ASSUMPTIONS.hoursPerDay).toBeLessThanOrEqual(24);
  });
});
