import { buildSeries, linearScale, splitAtCeiling } from "./chartMath.js";

const STEPS = 120;
const PAD = { top: 32, right: 24, bottom: 48, left: 72 };

function drawRegistrationMark(ctx, x, y, size, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - size, y);
  ctx.lineTo(x + size, y);
  ctx.moveTo(x, y - size);
  ctx.lineTo(x, y + size);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, size * 0.55, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawSeriesLine(
  ctx,
  points,
  xScale,
  yScale,
  costKey,
  { color, dashed }
) {
  if (points.length < 2) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3.5;
  ctx.setLineDash(dashed ? [9, 7] : []);
  ctx.beginPath();
  points.forEach((p, i) => {
    const x = xScale(p.tokens);
    const y = yScale(p[costKey]);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.restore();
}

function formatTokens(n) {
  if (!Number.isFinite(n)) return "∞";
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${Math.round(n)}`;
}

function formatCost(n) {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

/**
 * Resizes a canvas's backing store to match devicePixelRatio * its CSS box
 * size, so the chart stays crisp on retina displays and after a resize.
 */
export function fitCanvasToContainer(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { width, height, ctx };
}

/**
 * Draws the API-cost vs. self-host-cost crossover chart.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ width: number, height: number }} size - CSS pixel size
 * @param {object} params
 * @param {number} params.tokensMax
 * @param {number} params.pricePerMillionTokens
 * @param {number} params.selfHostMonthlyCost
 * @param {number} params.ceilingTokens
 * @param {number} params.breakevenTokens
 * @param {number} params.currentTokens
 * @param {object} params.colors - { api, selfHost, ink, mutedInk, grid }
 */
export function drawChart(ctx, size, params) {
  const {
    tokensMax,
    pricePerMillionTokens,
    selfHostMonthlyCost,
    ceilingTokens,
    breakevenTokens,
    currentTokens,
    colors,
  } = params;
  const { width, height } = size;

  ctx.clearRect(0, 0, width, height);

  const series = buildSeries({
    tokensMax,
    steps: STEPS,
    pricePerMillionTokens,
    selfHostMonthlyCost,
  });
  const maxCost =
    Math.max(...series.map((p) => Math.max(p.apiCost, p.selfHostCost)), 1) *
    1.15;

  const xScale = linearScale([0, tokensMax], [PAD.left, width - PAD.right]);
  const yScale = linearScale([0, maxCost], [height - PAD.bottom, PAD.top]);

  // grid + axes
  ctx.save();
  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;
  ctx.font = "500 12px 'Space Grotesk', system-ui, sans-serif";
  ctx.fillStyle = colors.mutedInk;
  const yTicks = 5;
  for (let i = 0; i <= yTicks; i++) {
    const value = (maxCost / yTicks) * i;
    const y = yScale(value);
    ctx.beginPath();
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(width - PAD.right, y);
    ctx.stroke();
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(formatCost(value), PAD.left - 10, y);
  }
  const xTicks = 5;
  for (let i = 0; i <= xTicks; i++) {
    const value = (tokensMax / xTicks) * i;
    const x = xScale(value);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(formatTokens(value), x, height - PAD.bottom + 10);
  }
  ctx.strokeStyle = colors.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PAD.left, PAD.top - 8);
  ctx.lineTo(PAD.left, height - PAD.bottom);
  ctx.lineTo(width - PAD.right, height - PAD.bottom);
  ctx.stroke();
  ctx.restore();

  // API line
  drawSeriesLine(ctx, series, xScale, yScale, "apiCost", {
    color: colors.api,
  });

  // self-host line: solid up to ceiling, dashed beyond
  const { solid, dashed } = splitAtCeiling(series, ceilingTokens);
  drawSeriesLine(ctx, solid, xScale, yScale, "selfHostCost", {
    color: colors.selfHost,
  });
  drawSeriesLine(ctx, dashed, xScale, yScale, "selfHostCost", {
    color: colors.selfHost,
    dashed: true,
  });

  // breakeven marker
  if (Number.isFinite(breakevenTokens) && breakevenTokens <= tokensMax) {
    const x = xScale(breakevenTokens);
    const y = yScale((breakevenTokens / 1_000_000) * pricePerMillionTokens);
    ctx.save();
    ctx.strokeStyle = colors.ink;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, height - PAD.bottom);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = colors.ink;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.font = "900 13px 'Archivo Black', system-ui, sans-serif";
    ctx.fillStyle = colors.ink;
    ctx.textAlign = x > width - PAD.right - 90 ? "right" : "left";
    ctx.textBaseline = "bottom";
    ctx.fillText(
      `break-even: ${formatTokens(breakevenTokens)} tokens/mo`,
      x + (ctx.textAlign === "right" ? -10 : 10),
      y - 10
    );
    ctx.restore();
  }

  // current-volume markers, cheaper line highlighted
  const currentApiCost = (currentTokens / 1_000_000) * pricePerMillionTokens;
  const currentSelfHostCost = selfHostMonthlyCost;
  const apiCheaper = currentApiCost <= currentSelfHostCost;
  const cx = xScale(Math.min(currentTokens, tokensMax));
  const markers = [
    { cost: currentApiCost, color: colors.api, cheaper: apiCheaper },
    {
      cost: currentSelfHostCost,
      color: colors.selfHost,
      cheaper: !apiCheaper,
    },
  ];
  markers.forEach(({ cost, color, cheaper }) => {
    const y = yScale(cost);
    ctx.save();
    if (cheaper) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, y, cheaper ? 7 : 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.ink;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  });

  // signature registration marks
  drawRegistrationMark(ctx, PAD.left * 0.45, PAD.top * 0.6, 8, colors.api);
  drawRegistrationMark(
    ctx,
    width - PAD.right * 0.45,
    PAD.top * 0.6,
    8,
    colors.selfHost
  );
}
