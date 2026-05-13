// chart.js
<<<<<<< HEAD
// Balancing robustness and functionality

=======
// Error Handling Prevent editing non-existent data

// SELECT CHART ELEMENT
>>>>>>> 5187aa4e57b4d5f53fdb19fb759ee9ae8705e7e6
const chartEl = document.querySelector(".chart");

let canvas = null;
let ctx = null;
let R = 0;

if (chartEl && typeof CONFIG !== "undefined" && CONFIG.CHART) {
<<<<<<< HEAD
=======
  // CREATE CANVAS ELEMENT
>>>>>>> 5187aa4e57b4d5f53fdb19fb759ee9ae8705e7e6
  canvas = document.createElement("canvas");
  canvas.width = CONFIG.CHART.WIDTH;
  canvas.height = CONFIG.CHART.HEIGHT;

  chartEl.appendChild(canvas);

<<<<<<< HEAD
=======
  // TO DRAW ON CANVAS, WE NEED TO GET CONTEXT OF CANVAS
>>>>>>> 5187aa4e57b4d5f53fdb19fb759ee9ae8705e7e6
  ctx = canvas.getContext("2d");

  if (ctx) {
    // CHANGE LINE WIDTH
    ctx.lineWidth = CONFIG.CHART.LINE_WIDTH;

    // CIRCLE RADIUS
    R = CONFIG.CHART.RADIUS;
  }
} else {
  console.warn("Chart container or chart config was not found.");
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

<<<<<<< HEAD
=======

>>>>>>> 5187aa4e57b4d5f53fdb19fb759ee9ae8705e7e6
  const ratio = total > 0 ? safeIncome / total : 0;

  drawCircle(CONFIG.COLORS.income, -ratio, true);
  drawCircle(CONFIG.COLORS.expense, 1 - ratio, false);
}