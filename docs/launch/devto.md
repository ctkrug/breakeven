---
title: "I built a calculator to settle the self-host vs. API argument"
published: false
tags: llm, javascript, webdev, ai
---

Every few weeks the same argument shows up on my timeline: is it cheaper to self-host an open
model than to pay an API per token? And every time, someone "settles" it by quoting one per-token
price against one GPU rental rate. No amortization. No electricity. No account of the fact that a
GPU sitting at 30% utilization costs the same as one pegged at 100%. It is not a comparison, it is
a vibe.

So I built [Breakeven](https://apps.charliekrug.com/breakeven/): you enter your monthly token
volume, pick a GPU, and it draws the actual crossover between owning hardware and renting tokens.
The whole thing is vanilla JavaScript, a Vite build, and a Canvas chart. Here are the two
decisions that made it worth writing about.

## The cost math is a pure core, and the UI is not allowed to know arithmetic

The temptation with a calculator like this is to compute inline: read the slider, do some math in
the event handler, paint the number. That rots fast. Instead the entire model is four pure
functions in `src/model.js` with no DOM and no imports:

```js
export function monthlySelfHostCost({
  gpuPrice, lifetimeMonths, powerDrawWatts, hoursPerDay, pricePerKwh, utilization,
}) {
  const amortization = gpuPrice / lifetimeMonths;
  const kwhPerMonth = (powerDrawWatts / 1000) * hoursPerDay * 30.44 * utilization;
  return amortization + kwhPerMonth * pricePerKwh;
}

export function breakevenTokens(selfHostMonthlyCost, pricePerMillionTokens) {
  if (pricePerMillionTokens <= 0) return Infinity;
  return (selfHostMonthlyCost / pricePerMillionTokens) * 1_000_000;
}
```

The big number in the header and the crossover marker on the chart both read from the same
`breakevenTokens`. There is exactly one place the answer can come from, which means a rounding
bug shows up in one spot, not two that quietly disagree. (That actually happened during QA: the
header and the chart label rounded the same value differently. One shared formatter fixed both.)

It also means the interesting logic is testable without a headless browser. The suite runs
property-based tests with fast-check over the core: for any valid inputs, self-host cost is
monotonic in utilization, the break-even scales linearly with price, and so on. Those catch a
class of bug that hand-picked examples never do.

## State lives in the URL, so "share" is just "copy the address bar"

There is no backend and no database. The full scenario (token volume, GPU, API price, electricity,
utilization, lifetime) is encoded into the query string on every change with `history.replaceState`,
and decoded on load. Sharing a specific chart is copying a link. Reloading restores exactly what
you had.

The part that took the most care was decoding hostile input. A URL is user-editable and often
mangled by chat apps, so `decodeScenario` validates every field independently and falls back to a
default on anything it does not like:

```js
const gpu = params.get("gpu");
if (gpu && valid.gpuIds.includes(gpu)) result.gpuId = gpu;

const util = toNumber(params.get("util"));
if (util !== null && util >= 0 && util <= 100) result.utilizationPercent = util;
```

`?tokens=abc&gpu=DROP_TABLE&util=999` does not throw and does not render a blank chart. It renders
the default scenario. Every field is guarded the same way, and there is a test that throws garbage
at it to prove the page survives.

## One honesty detail: the flat line is a lie past a point

Self-host cost is drawn as flat because buying a GPU is a fixed monthly cost regardless of volume.
But that is only true up to what one card can actually serve. Past that throughput ceiling you
need a second GPU, and the flat line becomes a step. Rather than pretend, the self-host line
switches to a dashed extrapolation beyond the ceiling with a note that scaling further needs
another card. It would have been easier to draw a clean straight line forever. It also would have
been wrong.

## What I would do differently

The throughput numbers are the soft spot. They are aggregate sustained tokens per second for a 7B
model on a continuous-batching server, which is a reasonable "small team" figure, but real numbers
swing hard with model size, quantization, and batch settings. A next version would let you plug in
your own measured throughput instead of trusting the catalog. I would also add the second-GPU step
explicitly rather than just marking where it starts.

Code and live demo:

- Live: https://apps.charliekrug.com/breakeven/
- Source: https://github.com/ctkrug/breakeven
