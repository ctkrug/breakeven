const HOURS_PER_MONTH_DAY = 30.44;

/**
 * Monthly cost of paying an API per token.
 * @param {number} tokensPerMonth
 * @param {number} pricePerMillionTokens - USD per 1M tokens
 */
export function monthlyApiCost(tokensPerMonth, pricePerMillionTokens) {
  return (tokensPerMonth / 1_000_000) * pricePerMillionTokens;
}

/**
 * Monthly cost of self-hosting on a given GPU: hardware amortization plus
 * electricity. Assumed independent of token volume up to the GPU's
 * throughput ceiling (handled separately by maxTokensPerMonth).
 * @param {object} params
 * @param {number} params.gpuPrice - USD purchase price
 * @param {number} params.lifetimeMonths - amortization period
 * @param {number} params.powerDrawWatts - sustained draw under load
 * @param {number} params.hoursPerDay - runtime hours per day
 * @param {number} params.pricePerKwh - USD per kWh
 * @param {number} params.utilization - duty cycle, 0–1
 */
export function monthlySelfHostCost({
  gpuPrice,
  lifetimeMonths,
  powerDrawWatts,
  hoursPerDay,
  pricePerKwh,
  utilization,
}) {
  const amortization = gpuPrice / lifetimeMonths;
  const kwhPerMonth =
    (powerDrawWatts / 1000) * hoursPerDay * HOURS_PER_MONTH_DAY * utilization;
  const electricity = kwhPerMonth * pricePerKwh;
  return amortization + electricity;
}

/**
 * Maximum tokens/month a GPU can serve, given its sustained throughput and
 * duty cycle. Above this, self-host cost is no longer flat — another GPU
 * is needed.
 * @param {number} tokensPerSecond
 * @param {number} hoursPerDay
 * @param {number} utilization
 */
export function maxTokensPerMonth(tokensPerSecond, hoursPerDay, utilization) {
  const secondsPerMonth = hoursPerDay * 3600 * HOURS_PER_MONTH_DAY * utilization;
  return tokensPerSecond * secondsPerMonth;
}

/**
 * The token volume at which self-host cost equals API cost. Below it,
 * paying per token is cheaper; above it, owning the GPU is cheaper.
 * @param {number} selfHostMonthlyCost - flat monthly self-host cost
 * @param {number} pricePerMillionTokens - API price
 * @returns {number} tokens/month, or Infinity if the API is never more
 *   expensive (price is zero or self-host cost is zero-and-negative)
 */
export function breakevenTokens(selfHostMonthlyCost, pricePerMillionTokens) {
  if (pricePerMillionTokens <= 0) return Infinity;
  return (selfHostMonthlyCost / pricePerMillionTokens) * 1_000_000;
}
