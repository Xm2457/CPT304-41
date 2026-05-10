// chart.js - Balancing robustness and functionality

// Select chart container elements
const chartEl = document.querySelector(".chart");

let canvas = null;
let ctx = null;
let R = 0;

// Ensure that the CONFIG configuration and container exist
if (chartEl && typeof CONFIG !== "undefined" && CONFIG.CHART) {
  // Create Canvas element
  canvas = document.createElement("canvas");
  canvas.width = CONFIG.CHART.WIDTH;
  canvas.height = CONFIG.CHART.HEIGHT;

  chartEl.appendChild(canvas);

  // Get drawing context
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

/**
 * Draw a circular arc function
 * @param {string} color - brush color
 * @param {number} ratio - Draw angle ratio（0~1）
 * @param {boolean} anticlockwise - Is it drawn counterclockwise
 */
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

/**
 * Update chart function
 * @param {number} income - income amount
 * @param {number} outcome - expense amount
 */
function updateChart(income, outcome) {
  if (!ctx || !canvas) return;

  const safeIncome = Number.isFinite(Number(income)) ? Number(income) : 0;
  const safeOutcome = Number.isFinite(Number(outcome)) ? Number(outcome) : 0;

  const total = safeIncome + safeOutcome;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Avoid dividing by 0 to avoid NaN
  const ratio = total > 0 ? safeIncome / total : 0;

  // Draw income section (counterclockwise)
  drawCircle(CONFIG.COLORS.income, -ratio, true);

  // Draw the expenditure section (clockwise)
  drawCircle(CONFIG.COLORS.expense, 1 - ratio, false);
}