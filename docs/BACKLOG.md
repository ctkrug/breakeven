# Backlog — Breakeven

Epics and stories for the build. Every story lists concrete, verifiable acceptance criteria —
no "works well" vibes. Story 1.1 is the wow moment and ships first.

## Epic 1 — Core crossover calculator

The reason this project exists: two cost lines, a slider, and the number where they cross.

- [ ] **1.1 — Live crossover chart with token-volume slider (WOW MOMENT)**
      Dragging a slider for monthly token volume redraws the API-cost line and the self-host-cost
      line on a canvas chart in real time, with the crossing point annotated on the chart itself.
  - Acceptance: dragging the slider from its min to max redraws the chart on every input event
    with no visible stutter (no debounce delay perceptible to a human dragging it).
  - Acceptance: the chart displays a text annotation reading "break-even: `<N>` tokens/mo" whose
    `<N>` matches `breakevenTokens()` from `src/model.js` for the current inputs, to within
    rounding used for display.
  - Acceptance: when self-host cost is currently below API cost at the slider's value, the
    self-host line is visually distinguished (e.g. highlighted) as the cheaper option, and vice
    versa.

- [ ] **1.2 — GPU catalog with amortization + electricity cost model**
      A curated list of at least 4 real GPUs (mixing consumer and datacenter cards), each with
      purchase price, power draw, and realistic sustained tokens/sec for a stated reference model
      size, feeding `monthlySelfHostCost()`.
  - Acceptance: selecting a different GPU changes the self-host cost line without a page reload.
  - Acceptance: each catalog entry's price/power/throughput fields are present and each has a
    short documented source or basis in a comment or accompanying doc (no unexplained magic
    numbers).

- [ ] **1.3 — API price reference panel**
      A short list of reference API prices (USD per million tokens) the user can pick from or
      override with a custom value.
  - Acceptance: choosing a reference price updates `monthlyApiCost()` inputs and the chart
    redraws.
  - Acceptance: entering a custom price overrides the selected reference without needing to
    deselect it first.

- [ ] **1.4 — Breakeven annotation "stamp" animation**
      When the computed breakeven volume changes, the callout re-stamps per the motion spec in
      `docs/DESIGN.md` (120ms scale + rotation settle).
  - Acceptance: changing any input that shifts the breakeven number retriggers the stamp
    animation (verifiable by a CSS class toggle or animation restart, not just a static value
    change).
  - Acceptance: with `prefers-reduced-motion: reduce`, the callout updates instantly with no
    scale/rotation animation.

- [ ] **1.5 — GPU throughput ceiling**
      Above a GPU's `maxTokensPerMonth()`, the flat self-host-cost assumption no longer holds (a
      second GPU would be needed), and the chart must say so rather than silently extrapolating.
  - Acceptance: past the computed ceiling, the self-host line is visually marked as an
    extrapolation (e.g. dashed) rather than rendered identically to the valid range.
  - Acceptance: a visible note states the ceiling volume and that scaling further requires
    additional hardware.

## Epic 2 — Inputs, assumptions & validation

Making the numbers trustworthy and adjustable, not hardcoded.

- [ ] **2.1 — Editable cost assumptions**
      Electricity price ($/kWh), utilization (0–100%), and hardware lifetime (months) are all
      editable fields with documented sane defaults, feeding `monthlySelfHostCost()` directly.
  - Acceptance: changing any one of the three fields recomputes the self-host cost line and the
    breakeven annotation without a page reload.
  - Acceptance: each field has a visible default value pre-filled on first load (not blank).

- [ ] **2.2 — Custom-styled GPU picker**
      The GPU selector is a custom-styled control (never a bare native `<select>`) with themed
      hover, focus, active, and disabled states matching `docs/DESIGN.md`.
  - Acceptance: keyboard Tab reaches the picker and shows a visible focus ring; Enter/Space or
    arrow keys can change the selection without a mouse.
  - Acceptance: hover and active/pressed states are visually distinct from the resting state
    (verifiable by inspecting applied classes/styles at each state).

- [ ] **2.3 — Inline input validation**
      Negative token volume, negative/zero prices, and utilization outside 0–100% are rejected with
      an inline error, never silently clamped or left to produce a NaN on the chart.
  - Acceptance: entering a negative number in the token-volume field shows an inline error
    message and the chart keeps showing the last valid state (no NaN/blank chart).
  - Acceptance: entering a utilization value above 100 or below 0 is flagged inline before it
    reaches `monthlySelfHostCost()`.

- [ ] **2.4 — Shareable scenario via URL**
      The current GPU choice, assumptions, and token volume are encoded into the URL query string
      and restored on load.
  - Acceptance: reloading a URL that was copied after adjusting inputs reproduces the same chart
    and same field values, with no server round-trip.
  - Acceptance: opening the app with no query string falls back to the documented defaults.

## Epic 3 — Design polish & responsive craft

Making it look and feel like the poster it's supposed to be, per `docs/DESIGN.md`.

- [ ] **3.1 — Design polish pass (poster direction, end to end)**
      Apply the full `docs/DESIGN.md` token set across every component: hard offset shadows, sharp
      corners, the two-tone wordmark, registration-mark corner details, and the Archivo
      Black/Space Grotesk type pairing.
  - Acceptance: no component uses a border-radius above 4px or a blurred/soft shadow.
  - Acceptance: the registration-mark detail and two-tone wordmark are present and visible on
    the main page.

- [ ] **3.2 — Responsive layout at 390 / 768 / 1440**
      The chart-plus-slider hero and the assumptions/GPU-picker rail compose correctly at phone,
      tablet, and desktop widths with no horizontal scroll or overlap.
  - Acceptance: at 390px width, the layout stacks vertically with the chart above the input
    panels and no element exceeds the viewport width.
  - Acceptance: at 1440px width, the chart occupies roughly the left 60%+ of the layout per
    `docs/DESIGN.md`'s layout intent.

- [ ] **3.3 — Accessibility pass**
      Keyboard operability, `aria-label`s on icon-only controls, a live region for the breakeven
      announcement, and honoring `prefers-reduced-motion`.
  - Acceptance: every interactive control (slider, picker, inputs) is reachable and operable via
    keyboard alone, in a sane tab order.
  - Acceptance: the breakeven number is inside an `aria-live` region so a screen reader announces
    changes when inputs change.

## Epic 4 — Landing polish & documentation

The page has to explain itself; the numbers have to be traceable.

- [ ] **4.1 — Methodology disclosure**
      A visible, non-buried section (or expandable panel) explaining the cost model in plain terms:
      what's amortized, what's assumed, and each default's source.
  - Acceptance: a user can find, without leaving the page, a written explanation of how
    `monthlySelfHostCost()` and `breakevenTokens()` are computed.
  - Acceptance: every default value used in Epic 1/2 (electricity price, utilization, lifetime,
    reference API prices) has a one-line documented basis in this section.

- [ ] **4.2 — GPU and API price catalog documentation**
      The data backing the GPU and API-price catalogs lives in a clearly named data module with a
      comment or doc noting where each number came from and when it was last checked.
  - Acceptance: `src/` contains a single identifiable data source file for the catalogs (not
    scattered inline literals across components).
  - Acceptance: the file or an adjacent doc records a last-checked/as-of note for the prices.
