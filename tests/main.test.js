import { beforeEach, describe, expect, it, vi } from "vitest";
import { breakevenTokens, monthlySelfHostCost } from "../src/model.js";
import { DEFAULT_ASSUMPTIONS, GPU_CATALOG } from "../src/data.js";

function stubCanvasContext() {
  const ctx = {
    save() {},
    restore() {},
    clearRect() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    fill() {},
    arc() {},
    fillText() {},
    setLineDash() {},
    setTransform() {},
  };
  HTMLCanvasElement.prototype.getContext = () => ctx;
}

async function mountApp() {
  document.body.innerHTML = '<div id="app"></div>';
  stubCanvasContext();
  vi.resetModules();
  await import("../src/main.js");
}

describe("app bootstrap", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("renders the wordmark and the token slider", async () => {
    await mountApp();
    expect(document.querySelector(".wordmark").textContent).toContain(
      "BREAKEVEN"
    );
    expect(document.getElementById("tokensSlider")).not.toBeNull();
  });

  it("shows a breakeven value matching the model for the default scenario", async () => {
    await mountApp();
    const defaultGpu = GPU_CATALOG[0];
    const selfHostCost = monthlySelfHostCost({
      gpuPrice: defaultGpu.gpuPrice,
      lifetimeMonths: DEFAULT_ASSUMPTIONS.lifetimeMonths,
      powerDrawWatts: defaultGpu.powerDrawWatts,
      hoursPerDay: DEFAULT_ASSUMPTIONS.hoursPerDay,
      pricePerKwh: DEFAULT_ASSUMPTIONS.pricePerKwh,
      utilization: DEFAULT_ASSUMPTIONS.utilization,
    });
    const expected = breakevenTokens(selfHostCost, 3);
    const text = document.getElementById("breakevenValue").textContent;
    expect(text).toContain(`${(expected / 1_000_000).toFixed(1)}M`);
  });

  it("updates the token number field and redraws when the slider moves", async () => {
    await mountApp();
    const slider = document.getElementById("tokensSlider");
    const number = document.getElementById("tokensNumber");
    slider.value = "150000000";
    slider.dispatchEvent(new Event("input"));
    expect(number.value).toBe("150000000");
  });

  it("updates the slider when the number field is edited directly", async () => {
    await mountApp();
    const slider = document.getElementById("tokensSlider");
    const number = document.getElementById("tokensNumber");
    number.value = "5000000";
    number.dispatchEvent(new Event("input"));
    expect(slider.value).toBe("5000000");
  });
});

describe("GPU picker", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("renders one option per catalog entry with the first selected", async () => {
    await mountApp();
    const options = document.querySelectorAll("#gpuPicker .option-btn");
    expect(options).toHaveLength(GPU_CATALOG.length);
    expect(options[0].getAttribute("aria-selected")).toBe("true");
    expect(options[0].tabIndex).toBe(0);
    expect(options[1].tabIndex).toBe(-1);
  });

  it("selects a GPU on click and updates the note text", async () => {
    await mountApp();
    const secondGpu = GPU_CATALOG[1];
    const options = document.querySelectorAll("#gpuPicker .option-btn");
    options[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(options[1].getAttribute("aria-selected")).toBe("true");
    expect(options[0].getAttribute("aria-selected")).toBe("false");
    expect(document.getElementById("gpuNote").textContent).toBe(secondGpu.note);
  });

  it("moves selection with ArrowRight and wraps at the end", async () => {
    await mountApp();
    const picker = document.getElementById("gpuPicker");
    const options = () => document.querySelectorAll("#gpuPicker .option-btn");
    for (let i = 0; i < GPU_CATALOG.length; i++) {
      picker.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })
      );
    }
    // wrapped all the way around back to the first option
    expect(options()[0].getAttribute("aria-selected")).toBe("true");
  });
});
