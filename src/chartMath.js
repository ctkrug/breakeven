/**
 * Pure layout/scaling math for the crossover chart, kept separate from
 * canvas drawing so it can be unit-tested without a DOM canvas context.
 */

import { monthlyApiCost } from "./model.js";

/**
 * Builds a linear scale function mapping a domain value to a range value.
 * @param {[number, number]} domain
 * @param {[number, number]} range
 * @returns {(value: number) => number}
 */
export function linearScale([d0, d1], [r0, r1]) {
  const span = d1 - d0;
  if (span === 0) return () => r0;
  return (value) => r0 + ((value - d0) / span) * (r1 - r0);
}

/**
 * Evenly spaced sample points for both cost lines over 0..tokensMax.
 * @param {object} params
 * @param {number} params.tokensMax
 * @param {number} params.steps - number of segments (points = steps + 1)
 * @param {number} params.pricePerMillionTokens
 * @param {number} params.selfHostMonthlyCost - flat cost, independent of x
 * @returns {{ tokens: number, apiCost: number, selfHostCost: number }[]}
 */
export function buildSeries({
  tokensMax,
  steps,
  pricePerMillionTokens,
  selfHostMonthlyCost,
}) {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const tokens = (tokensMax / steps) * i;
    points.push({
      tokens,
      apiCost: monthlyApiCost(tokens, pricePerMillionTokens),
      selfHostCost: selfHostMonthlyCost,
    });
  }
  return points;
}

/**
 * Splits a self-host series into the valid (solid) range up to the GPU's
 * throughput ceiling and the extrapolated (dashed) range beyond it. Both
 * segments share the boundary point so the drawn line stays continuous.
 * @param {{ tokens: number }[]} series
 * @param {number} ceilingTokens
 */
export function splitAtCeiling(series, ceilingTokens) {
  if (
    !Number.isFinite(ceilingTokens) ||
    ceilingTokens >= series.at(-1).tokens
  ) {
    return { solid: series, dashed: [] };
  }
  if (ceilingTokens <= series[0].tokens) {
    return { solid: [series[0]], dashed: series };
  }

  const splitIndex = series.findIndex((p) => p.tokens > ceilingTokens);
  const before = series[splitIndex - 1];
  const after = series[splitIndex];
  const t = (ceilingTokens - before.tokens) / (after.tokens - before.tokens);
  const boundary = {
    tokens: ceilingTokens,
    apiCost: before.apiCost + t * (after.apiCost - before.apiCost),
    selfHostCost:
      before.selfHostCost + t * (after.selfHostCost - before.selfHostCost),
  };

  return {
    solid: [...series.slice(0, splitIndex), boundary],
    dashed: [boundary, ...series.slice(splitIndex)],
  };
}
