// chart.js
// Balancing robustness and functionality

const chartEl = document.querySelector(".chart");

let canvas = null;
let ctx = null;
let R = 0;

if (chartEl && typeof CONFIG !== "undefined" && CONFIG.CHART) {
  canvas = document.createElement("canvas");
  canvas.width = CONFIG.CHART.WIDTH;
  canvas.height = CONFIG.CHART.HEIGHT;

  chartEl.appendChild(canvas);

  ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.lineWidth = CONFIG.CHART.LINE_WIDTH;
    R = CONFIG.CHART.RADIUS;
  } else {
    console.warn("Failed to get 2D context for canvas.");
  }
} else {
  console.warn("Chart container or CONFIG.CHART not found.");
}

function drawCircle(color, ratio, anticlockwise) {
  if (!ctx || !canvas) return;

  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(
    canvas.width / 2,
    canvas.height / 2,
    R,
    0,
    ratio * 2 * Math.PI,
    anticlockwise
  );
  ctx.stroke();
}

function updateChart(income, outcome) {
  if (!ctx || !canvas) return;

  const safeIncome = Number.isFinite(Number(income)) ? Number(income) : 0;
  const safeOutcome = Number.isFinite(Number(outcome)) ? Number(outcome) : 0;
  const total = safeIncome + safeOutcome;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const ratio = total > 0 ? safeIncome / total : 0;

  drawCircle(CONFIG.COLORS.income, -ratio, true);
  drawCircle(CONFIG.COLORS.expense, 1 - ratio, false);
}