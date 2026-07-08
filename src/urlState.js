/**
 * Encode/decode a scenario (GPU choice, API price choice, assumptions,
 * token volume) to and from a URL query string, so a link copied after
 * adjusting inputs reproduces the same chart on reload with no server.
 */

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function encodeScenario(scenario) {
  const params = new URLSearchParams();
  params.set("tokens", String(scenario.tokensPerMonth));
  params.set("gpu", scenario.gpuId);
  if (scenario.customApiPrice != null) {
    params.set("apiPrice", String(scenario.customApiPrice));
  } else if (scenario.apiPriceId != null) {
    params.set("api", scenario.apiPriceId);
  }
  params.set("kwh", String(scenario.pricePerKwh));
  params.set("util", String(scenario.utilizationPercent));
  params.set("life", String(scenario.lifetimeMonths));
  return params.toString();
}

/**
 * @param {string} search - a query string, with or without a leading "?"
 * @param {object} defaults - fallback scenario used for any missing/invalid field
 * @param {object} valid - { gpuIds: string[], apiPriceIds: string[] }
 */
export function decodeScenario(search, defaults, valid) {
  const params = new URLSearchParams(search);
  const result = { ...defaults };

  const tokens = toNumber(params.get("tokens"));
  if (tokens !== null && tokens >= 0) result.tokensPerMonth = tokens;

  const gpu = params.get("gpu");
  if (gpu && valid.gpuIds.includes(gpu)) result.gpuId = gpu;

  const customApiPrice = toNumber(params.get("apiPrice"));
  const api = params.get("api");
  if (customApiPrice !== null && customApiPrice > 0) {
    result.customApiPrice = customApiPrice;
    result.apiPriceId = null;
  } else if (api && valid.apiPriceIds.includes(api)) {
    result.apiPriceId = api;
    result.customApiPrice = null;
  }

  const kwh = toNumber(params.get("kwh"));
  if (kwh !== null && kwh > 0) result.pricePerKwh = kwh;

  const util = toNumber(params.get("util"));
  if (util !== null && util >= 0 && util <= 100) {
    result.utilizationPercent = util;
  }

  const life = toNumber(params.get("life"));
  if (life !== null && life > 0) result.lifetimeMonths = life;

  return result;
}
