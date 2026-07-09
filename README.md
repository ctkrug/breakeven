# Breakeven

[![CI](https://github.com/ctkrug/breakeven/actions/workflows/ci.yml/badge.svg)](https://github.com/ctkrug/breakeven/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Where does self-hosting an open model actually beat paying per-token?**

Breakeven is a small, focused calculator: enter your monthly token volume and pick a GPU, and
it plots the true crossover between running your own hardware and paying an API per token —
amortized GPU cost, electricity, and utilization included. Drag the slider, watch the two lines
cross, and read off the number: _"break-even: 42M tokens/mo."_

## Why

Every "should I self-host?" debate on Twitter turns into people quoting a single per-token price
against a single GPU rental rate, with no amortization, no utilization assumption, and no
electricity cost. That's not a fair comparison — it's a vibe. Breakeven turns the vibe into a
chart: give it real inputs (token volume, GPU choice, hours/day the box actually runs, power
price) and it tells you the exact monthly volume at which owning wins.

## The wow moment

Move the monthly-tokens slider. Two lines are plotted live — **API cost** (linear in tokens) and
**self-host cost** (flat-ish: GPU amortization + power, independent of volume up to the GPU's
throughput ceiling). Where they cross lights up on the chart with the number: _"break-even: 42M
tokens/mo."_ Everything below that volume, renting wins. Everything above it, owning wins.

## Features

- **Token volume input** — slider + direct numeric entry, with inline validation on bad input.
- **GPU catalog** — four real GPUs (consumer + datacenter: RTX 3090, RTX 4090, A100 80GB,
  H100 80GB) with purchase price, power draw, and a documented tokens/sec basis for each.
- **API price catalog** — four reference API price points ($/million tokens), or type a
  custom price that overrides the selected reference without deselecting it.
- **Amortization model** — GPU cost spread over an editable hardware lifetime (months), plus
  electricity cost from power draw × runtime hours × $/kWh, plus an editable utilization factor.
- **Live crossover chart** — self-host cost line vs. API cost line over a token-volume axis,
  with the break-even point annotated directly on the chart and re-stamped on every change.
- **Throughput ceiling** — past a GPU's tokens/mo ceiling the self-host line switches to a
  dashed extrapolation, with a visible note that scaling further needs a second GPU.
- **Shareable scenario** — every input round-trips through the URL query string; "Copy
  shareable link" puts it on the clipboard.
- **Methodology panel** — a plain-language explanation of both cost formulas plus the
  documented basis for every default and catalog entry.

## Stack

Plain JavaScript, no framework: a Vite-built static site with vanilla JS + Canvas for the chart
and a small pure-function core (`src/model.js`) that holds the cost math, unit-tested in
isolation from the UI. Ships as a single static `site/` directory — no server, no build
dependencies beyond Vite.

## Getting started

```sh
npm install
npm run dev      # local dev server
npm test         # run the cost-model unit tests
npm run build    # production build to site/
```

## Status

Core calculator is functionally complete — see [`docs/VISION.md`](docs/VISION.md) for the full
design, [`docs/DESIGN.md`](docs/DESIGN.md) for the visual direction,
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the codebase map, and
[`docs/BACKLOG.md`](docs/BACKLOG.md) for what's left.

## License

MIT — see [LICENSE](LICENSE).
