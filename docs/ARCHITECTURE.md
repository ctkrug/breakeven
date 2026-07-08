# Architecture — Breakeven

Static Vite + vanilla-JS app. No framework, no backend, no build step beyond `vite build`.

## Module map

```
src/
  model.js       pure cost math: monthlyApiCost, monthlySelfHostCost,
                 maxTokensPerMonth, breakevenTokens
  data.js        static data: GPU_CATALOG, API_PRICE_CATALOG, DEFAULT_ASSUMPTIONS,
                 DEFAULT_TOKENS_PER_MONTH, slider bounds
  validation.js  inline field validators — return { valid, error, value },
                 never throw
  urlState.js    encodeScenario / decodeScenario — scenario <-> URL query string,
                 per-field fallback to defaults on bad/missing values
  chartMath.js   pure chart layout math: linearScale, buildSeries, splitAtCeiling
                 (kept separate from chart.js so it's testable without a canvas)
  chart.js       canvas renderer: fitCanvasToContainer (devicePixelRatio scaling)
                 + drawChart (both cost lines, breakeven marker, ceiling dash,
                 current-volume dots, registration marks)
  main.js        DOM wiring: builds the app shell, owns `state`, and drives
                 render() on every input change
  style.css      design tokens (docs/DESIGN.md) + all component styling
```

## Data flow

1. `main.js` decodes the initial scenario from `window.location.search` via
   `urlState.decodeScenario`, falling back field-by-field to `data.js` defaults.
2. That scenario seeds a single mutable `state` object (token volume, selected GPU,
   selected/custom API price, electricity price, utilization, hardware lifetime).
3. Every control (slider, GPU picker, API picker, assumption fields) mutates `state`
   through a validator and calls `render()` — or, on invalid input, only updates the
   field's error text and leaves `state` and the chart untouched.
4. `render()`:
   - computes `monthlySelfHostCost` / `breakevenTokens` from `model.js`,
   - updates the breakeven callout (re-stamping it via a CSS class toggle if the
     displayed value changed) and the GPU ceiling note,
   - calls `chart.drawChart` to redraw the canvas,
   - calls `syncUrl()` to `history.replaceState` the current scenario.
5. On page load with a query string, step 1 reproduces the exact same `state`, so a
   shared link renders the same chart with no server round-trip.

## GPU / API pickers

Both are built by one generic `renderOptionPicker` helper in `main.js`: a `role="listbox"`
container of `role="option"` buttons with roving `tabindex` (arrow keys move the
selection, Tab reaches the widget as a single stop, Enter/Space or click confirms it).

## Testing

- `model.js`, `data.js`, `validation.js`, `urlState.js`, `chartMath.js` are pure — tested
  directly with plain Vitest (Node environment is enough).
- `chart.js` is tested against a hand-written stub `CanvasRenderingContext2D` (records
  calls instead of rendering), since jsdom has no real canvas backend.
- `main.js` is tested under `vitest`'s `jsdom` environment (see `vite.config.js`), with
  `HTMLCanvasElement.prototype.getContext` stubbed the same way, driving real DOM events
  (`input`, `click`, `keydown`) and asserting on the resulting DOM state.

## Running it

```sh
npm install
npm run dev      # local dev server
npm test         # full vitest suite
npm run lint      # eslint
npm run build     # static build to site/ (base path is relative — see vite.config.js)
```
