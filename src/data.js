/**
 * Static reference data backing the GPU and API-price catalogs.
 *
 * Sourcing note (last checked 2026-07-08): GPU purchase prices and power
 * draws are street/spec-sheet figures for new or lightly-used cards as of
 * mid-2026; throughput figures are approximate *aggregate* sustained
 * tokens/sec serving a 7B-parameter open model (4-bit quantized) via a
 * continuous-batching inference server such as vLLM or TGI — the realistic
 * "small team serving concurrent requests" case this tool targets, not a
 * single-stream chat benchmark. API prices are blended (3 input : 1 output
 * token ratio, a common assumption for chat-style workloads) from each
 * provider's published per-token rates. All figures are editable starting
 * points, not guarantees — verify against current vendor pricing before
 * relying on them for a purchase decision.
 */

export const GPU_CATALOG = [
  {
    id: "rtx3090",
    name: "RTX 3090",
    category: "consumer",
    gpuPrice: 900,
    powerDrawWatts: 350,
    tokensPerSecond: 65,
    note: "24GB GDDR6X, used market price mid-2026; 65 tok/s aggregate is a conservative community figure for 7B Q4 serving.",
  },
  {
    id: "rtx4090",
    name: "RTX 4090",
    category: "consumer",
    gpuPrice: 1600,
    powerDrawWatts: 450,
    tokensPerSecond: 120,
    note: "24GB GDDR6X, new price mid-2026; ~2x the 3090's serving throughput per common vLLM/TGI benchmarks.",
  },
  {
    id: "a100-80gb",
    name: "A100 80GB SXM",
    category: "datacenter",
    gpuPrice: 9500,
    powerDrawWatts: 400,
    tokensPerSecond: 180,
    note: "80GB HBM2e SXM4 module, new price mid-2026; higher memory bandwidth lifts aggregate serving throughput.",
  },
  {
    id: "h100-80gb",
    name: "H100 80GB SXM",
    category: "datacenter",
    gpuPrice: 27000,
    powerDrawWatts: 700,
    tokensPerSecond: 280,
    note: "80GB HBM3 SXM5 module, new price mid-2026; Transformer Engine + higher bandwidth roughly 1.5x the A100.",
  },
];

export const API_PRICE_CATALOG = [
  {
    id: "gpt-4o-mini",
    name: "GPT-4o mini",
    pricePerMillionTokens: 0.26,
    note: "$0.15/M in, $0.60/M out; blended at a 3:1 input:output ratio.",
  },
  {
    id: "llama-3.3-70b-hosted",
    name: "Llama 3.3 70B (hosted)",
    pricePerMillionTokens: 0.4,
    note: "Third-party hosted pricing (Meta has no official API); mid-range across providers.",
  },
  {
    id: "claude-haiku",
    name: "Claude Haiku 4.5",
    pricePerMillionTokens: 2.0,
    note: "$1.00/M in, $5.00/M out; blended at a 3:1 input:output ratio.",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    pricePerMillionTokens: 4.38,
    note: "$2.50/M in, $10.00/M out; blended at a 3:1 input:output ratio.",
  },
];

export const DEFAULT_ASSUMPTIONS = {
  pricePerKwh: 0.15,
  utilization: 0.7,
  lifetimeMonths: 24,
  hoursPerDay: 24,
};

export const DEFAULT_TOKENS_PER_MONTH = 20_000_000;

export const TOKENS_SLIDER_MIN = 100_000;
export const TOKENS_SLIDER_MAX = 500_000_000;
