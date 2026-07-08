import {
  breakevenTokens,
  maxTokensPerMonth,
  monthlySelfHostCost,
} from "./model.js";
import {
  API_PRICE_CATALOG,
  DEFAULT_ASSUMPTIONS,
  DEFAULT_TOKENS_PER_MONTH,
  GPU_CATALOG,
  TOKENS_SLIDER_MAX,
  TOKENS_SLIDER_MIN,
} from "./data.js";
import { drawChart, fitCanvasToContainer } from "./chart.js";
import {
  validateLifetimeMonths,
  validatePrice,
  validateTokensPerMonth,
  validateUtilizationPercent,
} from "./validation.js";

const app = document.getElementById("app");

app.innerHTML = `
  <header class="app-header">
    <h1 class="wordmark">
      <span class="wordmark-break">BREAK</span><span class="wordmark-even">EVEN</span>
    </h1>
    <p class="tagline">
      Where does self-hosting an open model beat paying per-token?
      Slide your monthly token volume and watch the crossover.
    </p>
  </header>

  <main class="layout">
    <section class="chart-panel" aria-label="Cost crossover chart">
      <div class="chart-callout" id="breakevenCallout" aria-live="polite">
        <span class="callout-label">break-even</span>
        <span class="callout-value" id="breakevenValue">—</span>
      </div>
      <div class="chart-canvas-wrap">
        <canvas id="chartCanvas" role="img" aria-label="Cost crossover chart"></canvas>
      </div>
      <p class="ceiling-note" id="ceilingNote" aria-live="polite"></p>
      <div class="slider-row">
        <label class="field-label" for="tokensSlider">Monthly token volume</label>
        <input
          type="range"
          id="tokensSlider"
          class="slider"
          min="100000"
          max="500000000"
          step="100000"
        />
        <div class="slider-value-row">
          <input type="number" id="tokensNumber" class="field-input" min="0" step="100000" />
          <span class="field-suffix">tokens / month</span>
        </div>
        <p class="field-error" id="tokensError" role="alert"></p>
      </div>
    </section>

    <aside class="rail">
      <section class="panel" aria-labelledby="gpuPanelTitle">
        <h2 class="panel-title" id="gpuPanelTitle">Self-host GPU</h2>
        <div id="gpuPicker" class="gpu-picker" role="listbox" aria-label="GPU choice"></div>
        <p class="panel-note" id="gpuNote"></p>
      </section>

      <section class="panel" aria-labelledby="assumptionsPanelTitle">
        <h2 class="panel-title" id="assumptionsPanelTitle">Cost assumptions</h2>
        <div class="field">
          <label class="field-label" for="kwhInput">Electricity price ($/kWh)</label>
          <input type="number" id="kwhInput" class="field-input" min="0" step="0.01" />
          <p class="field-error" id="kwhError" role="alert"></p>
        </div>
        <div class="field">
          <label class="field-label" for="utilInput">Utilization (%)</label>
          <input type="number" id="utilInput" class="field-input" min="0" max="100" step="1" />
          <p class="field-error" id="utilError" role="alert"></p>
        </div>
        <div class="field">
          <label class="field-label" for="lifetimeInput">Hardware lifetime (months)</label>
          <input type="number" id="lifetimeInput" class="field-input" min="1" step="1" />
          <p class="field-error" id="lifetimeError" role="alert"></p>
        </div>
      </section>

      <section class="panel" aria-labelledby="apiPanelTitle">
        <h2 class="panel-title" id="apiPanelTitle">API price reference</h2>
        <div id="apiPicker" class="api-picker" role="listbox" aria-label="Reference API price"></div>
        <div class="field">
          <label class="field-label" for="customApiInput">Custom price ($ / 1M tokens)</label>
          <input type="number" id="customApiInput" class="field-input" min="0" step="0.01" placeholder="override" />
          <p class="field-error" id="customApiError" role="alert"></p>
        </div>
      </section>

      <section class="panel" aria-labelledby="methodologyTitle">
        <details class="methodology">
          <summary id="methodologyTitle">How this is calculated</summary>
          <div class="methodology-body" id="methodologyBody"></div>
        </details>
      </section>

      <section class="panel share-panel">
        <button type="button" class="btn" id="copyLinkBtn">Copy shareable link</button>
        <p class="field-status" id="copyStatus" role="status"></p>
      </section>
    </aside>
  </main>
`;

const state = {
  tokensPerMonth: DEFAULT_TOKENS_PER_MONTH,
  gpu: GPU_CATALOG[0],
  apiPrice: API_PRICE_CATALOG[0],
  customApiPrice: null,
  ...DEFAULT_ASSUMPTIONS,
};

const canvas = document.getElementById("chartCanvas");
const breakevenValueEl = document.getElementById("breakevenValue");
const tokensSlider = document.getElementById("tokensSlider");
const tokensNumber = document.getElementById("tokensNumber");

tokensSlider.min = String(TOKENS_SLIDER_MIN);
tokensSlider.max = String(TOKENS_SLIDER_MAX);
tokensSlider.value = String(state.tokensPerMonth);
tokensNumber.value = String(state.tokensPerMonth);

function formatTokensLabel(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${Math.round(n)}`;
}

function currentSelfHostMonthlyCost() {
  return monthlySelfHostCost({
    gpuPrice: state.gpu.gpuPrice,
    lifetimeMonths: state.lifetimeMonths,
    powerDrawWatts: state.gpu.powerDrawWatts,
    hoursPerDay: state.hoursPerDay,
    pricePerKwh: state.pricePerKwh,
    utilization: state.utilization,
  });
}

function currentPricePerMillionTokens() {
  return state.customApiPrice ?? state.apiPrice.pricePerMillionTokens;
}

const ceilingNote = document.getElementById("ceilingNote");

function render() {
  const selfHostCost = currentSelfHostMonthlyCost();
  const pricePerMillionTokens = currentPricePerMillionTokens();
  const ceilingTokens = maxTokensPerMonth(
    state.gpu.tokensPerSecond,
    state.hoursPerDay,
    state.utilization
  );
  const breakeven = breakevenTokens(selfHostCost, pricePerMillionTokens);

  breakevenValueEl.textContent = Number.isFinite(breakeven)
    ? `${formatTokensLabel(breakeven)} tokens/mo`
    : "never";

  const pastCeiling = state.tokensPerMonth > ceilingTokens;
  ceilingNote.textContent = `${state.gpu.name} tops out around ${formatTokensLabel(ceilingTokens)} tokens/mo at this utilization — scaling further requires a second GPU.`;
  ceilingNote.classList.toggle("ceiling-note--exceeded", pastCeiling);

  const { width, height, ctx } = fitCanvasToContainer(canvas);
  const styles = getComputedStyle(document.documentElement);
  drawChart(
    ctx,
    { width, height },
    {
      tokensMax: Number(tokensSlider.max),
      pricePerMillionTokens,
      selfHostMonthlyCost: selfHostCost,
      ceilingTokens,
      breakevenTokens: breakeven,
      currentTokens: state.tokensPerMonth,
      colors: {
        api: styles.getPropertyValue("--accent").trim(),
        selfHost: styles.getPropertyValue("--accent-support").trim(),
        ink: styles.getPropertyValue("--line").trim(),
        mutedInk: styles.getPropertyValue("--text-muted").trim(),
        grid: styles.getPropertyValue("--surface-2").trim(),
      },
    }
  );
}

function setTokens(value) {
  state.tokensPerMonth = value;
  tokensSlider.value = String(value);
  tokensNumber.value = String(value);
  render();
}

const tokensError = document.getElementById("tokensError");

tokensSlider.addEventListener("input", () => {
  tokensError.textContent = "";
  setTokens(Number(tokensSlider.value));
});

tokensNumber.addEventListener("input", () => {
  const result = validateTokensPerMonth(tokensNumber.value);
  if (result.valid) {
    tokensError.textContent = "";
    state.tokensPerMonth = result.value;
    tokensSlider.value = String(result.value);
    render();
  } else {
    tokensError.textContent = result.error;
  }
});

function renderOptionPicker(container, items, selectedId, labelOf, onSelect) {
  container.innerHTML = items
    .map(
      (item) => `
        <button
          type="button"
          class="option-btn"
          role="option"
          data-id="${item.id}"
          aria-selected="${item.id === selectedId}"
          tabindex="${item.id === selectedId ? "0" : "-1"}"
        >${labelOf(item)}</button>
      `
    )
    .join("");

  function selectById(id, focus) {
    onSelect(id);
    [...container.children].forEach((btn) => {
      const selected = btn.dataset.id === id;
      btn.setAttribute("aria-selected", String(selected));
      btn.tabIndex = selected ? 0 : -1;
      if (selected && focus) btn.focus();
    });
  }

  container.addEventListener("click", (event) => {
    const btn = event.target.closest(".option-btn");
    if (btn) selectById(btn.dataset.id, false);
  });

  container.addEventListener("keydown", (event) => {
    const buttons = [...container.children];
    const currentIndex = buttons.findIndex(
      (b) => b.getAttribute("aria-selected") === "true"
    );
    if (["ArrowRight", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      selectById(buttons[(currentIndex + 1) % buttons.length].dataset.id, true);
    } else if (["ArrowLeft", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      selectById(
        buttons[(currentIndex - 1 + buttons.length) % buttons.length].dataset
          .id,
        true
      );
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const btn = event.target.closest(".option-btn");
      if (btn) selectById(btn.dataset.id, true);
    }
  });
}

const gpuPicker = document.getElementById("gpuPicker");
const gpuNote = document.getElementById("gpuNote");

function updateGpuNote() {
  gpuNote.textContent = state.gpu.note;
}

renderOptionPicker(
  gpuPicker,
  GPU_CATALOG,
  state.gpu.id,
  (gpu) =>
    `<span class="option-name">${gpu.name}</span><span class="option-meta">$${gpu.gpuPrice.toLocaleString()} · ${gpu.powerDrawWatts}W</span>`,
  (id) => {
    state.gpu = GPU_CATALOG.find((g) => g.id === id);
    updateGpuNote();
    render();
  }
);
updateGpuNote();

function wireValidatedField(input, errorEl, validate, apply) {
  input.addEventListener("input", () => {
    const result = validate(input.value);
    if (result.valid) {
      errorEl.textContent = "";
      apply(result.value);
      render();
    } else {
      errorEl.textContent = result.error;
    }
  });
}

const kwhInput = document.getElementById("kwhInput");
const utilInput = document.getElementById("utilInput");
const lifetimeInput = document.getElementById("lifetimeInput");

kwhInput.value = String(state.pricePerKwh);
utilInput.value = String(Math.round(state.utilization * 100));
lifetimeInput.value = String(state.lifetimeMonths);

wireValidatedField(
  kwhInput,
  document.getElementById("kwhError"),
  (v) => validatePrice(v, "Electricity price"),
  (v) => {
    state.pricePerKwh = v;
  }
);
wireValidatedField(
  utilInput,
  document.getElementById("utilError"),
  validateUtilizationPercent,
  (v) => {
    state.utilization = v;
  }
);
wireValidatedField(
  lifetimeInput,
  document.getElementById("lifetimeError"),
  validateLifetimeMonths,
  (v) => {
    state.lifetimeMonths = v;
  }
);

const apiPicker = document.getElementById("apiPicker");
const customApiInput = document.getElementById("customApiInput");
const customApiError = document.getElementById("customApiError");

renderOptionPicker(
  apiPicker,
  API_PRICE_CATALOG,
  state.apiPrice.id,
  (entry) =>
    `<span class="option-name">${entry.name}</span><span class="option-meta">$${entry.pricePerMillionTokens.toFixed(2)} / 1M</span>`,
  (id) => {
    state.apiPrice = API_PRICE_CATALOG.find((e) => e.id === id);
    render();
  }
);

customApiInput.addEventListener("input", () => {
  if (customApiInput.value.trim() === "") {
    customApiError.textContent = "";
    state.customApiPrice = null;
    render();
    return;
  }
  const result = validatePrice(customApiInput.value, "Custom price");
  if (result.valid) {
    customApiError.textContent = "";
    state.customApiPrice = result.value;
    render();
  } else {
    customApiError.textContent = result.error;
  }
});

window.addEventListener("resize", render);

render();
