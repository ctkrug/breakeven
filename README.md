# Breakeven

**▶ Live demo: [apps.charliekrug.com/breakeven](https://apps.charliekrug.com/breakeven/)**

[![CI](https://github.com/ctkrug/breakeven/actions/workflows/ci.yml/badge.svg)](https://github.com/ctkrug/breakeven/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**See where self-hosting an open model beats paying an API per token.**

Breakeven is a small, focused calculator for engineers and technical founders running a steady
LLM workload. Enter your monthly token volume, pick a GPU, and it plots the real crossover between
owning hardware and paying per token: GPU purchase amortized over its lifetime, electricity, and
utilization all folded in. Drag the slider, watch the two lines cross, and read off the number.

## Why it exists

Every "should we self-host?" thread settles the same lazy way: one per-token API price quoted
against one GPU rental rate, with no amortization, no utilization, and no electricity cost. That
is not a comparison, it is a guess. Breakeven turns the guess into a chart. Give it real inputs
(token volume, GPU, hours per day the box actually runs, power price) and it tells you the exact
monthly volume at which owning wins.

## Sample output

```
                    BREAK-EVEN
                    42M tokens/mo

  cost ($/mo)
    |            API cost  ╱
    |                    ╱
    |         ┄┄┄┄┄┄┄┄┄●┄┄┄┄┄┄┄  self-host (flat)
    |        ╱         ┆
    |      ╱           ┆ break-even
    +──────────────────┴──────────────  tokens / month
```

Below 42M tokens/mo the API is cheaper; above it, owning an RTX 4090 wins. Change the GPU,
the electricity price, or the API reference and the crossover moves live.

## Features

- **Token volume input:** slider plus direct numeric entry, with inline validation on bad input.
- **GPU catalog:** four real GPUs (RTX 3090, RTX 4090, A100 80GB, H100 80GB) with purchase price,
  power draw, and a documented tokens/sec serving basis for each.
- **API price catalog:** four reference price points ($/million tokens), or type a custom price
  that overrides the selection without deselecting it.
- **Amortization model:** GPU cost spread over an editable hardware lifetime, plus electricity from
  power draw × runtime hours × $/kWh, plus an editable utilization factor.
- **Live crossover chart:** self-host vs. API cost over a token-volume axis, with the break-even
  point annotated on the chart and re-stamped on every change.
- **Throughput ceiling:** past a GPU's tokens/mo ceiling the self-host line goes dashed, with a
  note that scaling further needs a second GPU.
- **Shareable scenario:** every input round-trips through the URL; "Copy shareable link" puts it on
  the clipboard, no server or account involved.
- **Methodology panel:** a plain-language explanation of both cost formulas and the documented
  basis for every default and catalog entry.

## How it works

The API cost line is `monthlyTokens / 1,000,000 × pricePerMillionTokens`, linear in volume. The
self-host line is `gpuPrice / lifetimeMonths + electricity`, where electricity is
`powerDrawWatts / 1000 × hoursPerDay × 30.44 × utilization × pricePerKwh`, flat and independent of
volume until the GPU's throughput ceiling. The break-even volume is where the two are equal:
`selfHostMonthlyCost / pricePerMillionTokens × 1,000,000`. All of this lives in
[`src/model.js`](src/model.js), a dependency-free pure-function core unit-tested apart from the UI.

## Stack

Plain JavaScript, no framework: a Vite-built static site with vanilla JS and Canvas for the chart,
plus a small pure-function core for the cost math. Ships as a single static `site/` directory with
no runtime dependencies.

## Getting started

```sh
npm install
npm run dev      # local dev server
npm test         # run the test suite
npm run build    # production build to site/
```

## Testing

100 tests across the cost model, chart math, validation, URL state, and the wired-up UI, including
property-based tests (fast-check) on the core math. Run `npm run test:coverage` for the report
(100% statement, 98% branch on `src/`).

## Docs

- [`docs/VISION.md`](docs/VISION.md): the product idea and scope.
- [`docs/DESIGN.md`](docs/DESIGN.md): the visual direction and tokens.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): the codebase map.
- [`docs/BACKLOG.md`](docs/BACKLOG.md): what is done and what is left.

## License

MIT, see [LICENSE](LICENSE).

---

More of Charlie's projects → [apps.charliekrug.com](https://apps.charliekrug.com)
</content>
