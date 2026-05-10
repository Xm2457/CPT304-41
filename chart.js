// =========== Chart related =============
// SELECT CHART ELEMENT
const chartEl = document.querySelector(".chart");

// CREATE CANVAS ELEMENT
const canvas = document.createElement("canvas");
canvas.width = CONFIG.CHART.WIDTH;
canvas.height = CONFIG.CHART.HEIGHT;

chartEl.appendChild(canvas);

// TO DRAW ON CANVAS, WE NEED TO GET CONTEXT OF CANVAS
const ctx = canvas.getContext("2d");

// CHANGE LINE WIDTH
ctx.lineWidth = CONFIG.CHART.LINE_WIDTH;

// CIRCLE RADIUS
const R = CONFIG.CHART.RADIUS;

function drawCircle(color, ratio, anticlockwise) {
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let ratio = income / (outcome + income);
  
  // Handling zero elimination situations
  if (isNaN(ratio)) ratio = 0;

  drawCircle(CONFIG.COLORS.income, -ratio, true);
  drawCircle(CONFIG.COLORS.expense, 1 - ratio, false);
}