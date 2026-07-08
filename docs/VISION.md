# Vision — Breakeven

## The problem

Whenever "should I self-host an open model instead of paying an API?" comes up, the debate
almost always collapses into one side quoting a per-token API price and the other side quoting
a GPU rental rate — with no shared basis. Nobody amortizes the hardware purchase, nobody
accounts for the fact that a box sitting idle at 2am is still costing money to have bought, and
nobody factors in electricity. It's an argument of vibes, not a comparison of costs, and it
never produces a number anyone can act on.

## Who it's for

Developers and small teams running enough LLM inference that "buy vs. rent" is a real decision
— not hobbyists running one prompt a day, and not hyperscale operators who already have FinOps
teams for this. The person who's outgrown a $20/month API bill and is eyeing a GPU on eBay, and
wants one honest number before they commit.

## The core idea

Reduce the decision to two comparable monthly cost lines plotted against the same x-axis (tokens
processed per month):

- **API cost** — linear: `tokens/month ÷ 1,000,000 × price per million tokens`.
- **Self-host cost** — effectively flat below the GPU's throughput ceiling: GPU purchase price
  amortized over its useful life, plus electricity (power draw × runtime hours × utilization ×
  price per kWh). It doesn't grow with token volume until you need a second GPU.

Where those two lines cross is the breakeven point: the token volume below which paying per
token is cheaper, and above which owning the hardware is cheaper. That single number — "42M
tokens/mo" — is the entire product. Everything else (GPU catalog, API price reference,
assumption inputs) exists to make that number trustworthy and adjustable, not to bury it.

## Key design decisions

- **Pure cost math, separate from the UI.** `src/model.js` holds every calculation as a pure
  function with no DOM or chart dependency, so the math can be unit-tested and trusted
  independently of how it's drawn (see `docs/BACKLOG.md` epic 1).
- **Self-host cost is flat, not zero-slope-forever.** A single GPU has a real throughput
  ceiling (tokens/sec × available runtime hours). Past that ceiling the flat-cost assumption
  breaks — the model must surface that ceiling rather than silently extrapolating a lie.
- **Assumptions are inputs, not constants.** Electricity price, utilization, hardware lifetime,
  and API reference prices all drift by region and by month. Every one of them is an editable
  field with a sane default, never a hardcoded number the user can't see or change.
  Sensible defaults: 24 months of amortization life, real-world utilization noticeably under
  100% (hardware is rarely pegged), and a starting API price pulled from a well-known reference
  point (documented in-app, not hidden).
- **No backend.** Everything — the GPU catalog, the API price reference, the cost math —
  ships as static data and client-side JS. The whole app is one static `dist`/`site` directory
  (see `README.md`), because the entire value is a client-side calculation with no
  user data worth persisting server-side.
- **Shareable via URL, not accounts.** A scenario (chosen GPU + assumptions + token volume) is
  encoded into the URL query string. No login, no server-side storage — copy the link, send it,
  done.
- **The chart is the product.** The breakeven number and the two crossing lines are the hero of
  the page (per `docs/DESIGN.md`); the GPU picker and assumption fields are supporting inputs in
  a side rail, never competing with the chart for visual weight.

## What "v1 done" looks like

- Moving the token-volume slider redraws both cost lines and the breakeven annotation live, with
  no perceptible lag.
- At least four real GPUs (mix of consumer and datacenter) are selectable, each with a
  documented source for its price/power/throughput assumptions.
- Changing any assumption (electricity price, utilization, hardware lifetime, API price)
  recomputes the breakeven point immediately.
- The current scenario round-trips through the URL: reloading a shared link reproduces the
  same chart and inputs.
- Invalid inputs (negative tokens, zero-and-below prices) are caught and shown inline, never a
  silent NaN on the chart.
- The full cost model (`src/model.js`) has unit test coverage for every function.
- The page passes the design standard's ship gate: composed and legible at 390/768/1440px,
  every control has real interaction states, and it matches `docs/DESIGN.md`'s direction.
