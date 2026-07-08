import { describe, expect, it } from "vitest";
import { drawChart } from "../src/chart.js";

function createStubContext() {
  const calls = { stroke: 0, fill: 0, arc: 0, fillText: 0, setLineDash: [] };
  const ctx = {
    save() {},
    restore() {},
    clearRect() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {
      calls.stroke++;
    },
    fill() {
      calls.fill++;
    },
    arc() {
      calls.arc++;
    },
    fillText(text) {
      calls.fillText++;
      calls.lastText = text;
    },
    setLineDash(pattern) {
      calls.setLineDash.push(pattern);
    },
  };
  return { ctx, calls };
}

const colors = {
  api: "#E8451A",
  selfHost: "#0E7C7B",
  ink: "#14120F",
  mutedInk: "#6B6459",
  grid: "#E8E1D2",
};

const baseParams = {
  tokensMax: 100_000_000,
  pricePerMillionTokens: 2,
  selfHostMonthlyCost: 100,
  ceilingTokens: Infinity,
  breakevenTokens: 50_000_000,
  currentTokens: 20_000_000,
  colors,
};

describe("drawChart", () => {
  it("renders without throwing given valid params", () => {
    const { ctx } = createStubContext();
    expect(() =>
      drawChart(ctx, { width: 800, height: 500 }, baseParams)
    ).not.toThrow();
  });

  it("draws the breakeven annotation label when the crossover is in range", () => {
    const { ctx, calls } = createStubContext();
    drawChart(ctx, { width: 800, height: 500 }, baseParams);
    expect(calls.fillText).toBeGreaterThan(0);
    const texts = [];
    ctx.fillText = (t) => texts.push(t);
    drawChart(ctx, { width: 800, height: 500 }, baseParams);
    expect(texts.some((t) => t.includes("break-even"))).toBe(true);
    expect(texts.some((t) => t.includes("50M"))).toBe(true);
  });

  it("uses a dashed line pattern when the volume ceiling is inside the domain", () => {
    const { ctx, calls } = createStubContext();
    drawChart(
      ctx,
      { width: 800, height: 500 },
      { ...baseParams, ceilingTokens: 40_000_000 }
    );
    const dashedCalls = calls.setLineDash.filter((p) => p.length > 0);
    expect(dashedCalls.length).toBeGreaterThan(0);
  });

  it("does not draw a breakeven annotation when the crossover never happens", () => {
    const { ctx } = createStubContext();
    const texts = [];
    ctx.fillText = (t) => texts.push(t);
    drawChart(
      ctx,
      { width: 800, height: 500 },
      { ...baseParams, breakevenTokens: Infinity }
    );
    expect(texts.some((t) => t.includes("break-even"))).toBe(false);
  });

  it("handles a zero self-host cost and zero API price without throwing", () => {
    const { ctx } = createStubContext();
    expect(() =>
      drawChart(
        ctx,
        { width: 800, height: 500 },
        {
          ...baseParams,
          selfHostMonthlyCost: 0,
          pricePerMillionTokens: 0,
          breakevenTokens: Infinity,
        }
      )
    ).not.toThrow();
  });
});
