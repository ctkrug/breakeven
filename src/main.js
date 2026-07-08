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
