// chart.js - 兼顾健壮性和功能性

// 选择图表容器元素
const chartEl = document.querySelector(".chart");

let canvas = null;
let ctx = null;
let R = 0;

// 确保 CONFIG 配置和容器存在
if (chartEl && typeof CONFIG !== "undefined" && CONFIG.CHART) {
  // 创建 Canvas 元素
  canvas = document.createElement("canvas");
  canvas.width = CONFIG.CHART.WIDTH;
  canvas.height = CONFIG.CHART.HEIGHT;

  chartEl.appendChild(canvas);

  // 获取绘图上下文
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
 * 绘制圆弧函数
 * @param {string} color - 画笔颜色
 * @param {number} ratio - 绘制的角度比例（0~1）
 * @param {boolean} anticlockwise - 是否逆时针绘制
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
 * 更新图表函数
 * @param {number} income - 收入金额
 * @param {number} outcome - 支出金额
 */
function updateChart(income, outcome) {
  if (!ctx || !canvas) return;

  const safeIncome = Number.isFinite(Number(income)) ? Number(income) : 0;
  const safeOutcome = Number.isFinite(Number(outcome)) ? Number(outcome) : 0;

  const total = safeIncome + safeOutcome;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 避免除以0导致NaN
  const ratio = total > 0 ? safeIncome / total : 0;

  // 绘制收入部分（逆时针）
  drawCircle(CONFIG.COLORS.income, -ratio, true);

  // 绘制支出部分（顺时针）
  drawCircle(CONFIG.COLORS.expense, 1 - ratio, false);
}