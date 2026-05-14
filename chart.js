// chart.js
// Chart drawing logic with browser support and Jest/CommonJS test support.

(function (root) {
  let canvas = null;
  let ctx = null;
  let R = 0;

  function getConfig() {
    return root.CONFIG || null;
  }

  function getDocument() {
    return root.document || null;
  }

  function initChart() {
    const config = getConfig();
    const doc = getDocument();

    /* istanbul ignore next */
    if (!doc) {
      return false;
    }

    const chartEl = doc.querySelector(".chart");

    if (!chartEl || !config || !config.CHART) {
      console.warn("Chart container or CONFIG.CHART not found.");
      return false;
    }

    const oldCanvas = chartEl.querySelector("canvas[data-budget-chart='true']");

    if (oldCanvas) {
      oldCanvas.remove();
    }

    canvas = doc.createElement("canvas");
    canvas.width = config.CHART.WIDTH;
    canvas.height = config.CHART.HEIGHT;
    canvas.dataset.budgetChart = "true";

    chartEl.appendChild(canvas);

    ctx = canvas.getContext("2d");

    if (!ctx) {
      console.warn("Failed to get 2D context for canvas.");
      return false;
    }

    ctx.lineWidth = config.CHART.LINE_WIDTH;
    R = config.CHART.RADIUS;

    return true;
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
    const config = getConfig();

    if (!ctx || !canvas || !config || !config.COLORS) return;

    const safeIncome = Number.isFinite(Number(income)) ? Number(income) : 0;
    const safeOutcome = Number.isFinite(Number(outcome)) ? Number(outcome) : 0;
    const total = safeIncome + safeOutcome;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const ratio = total > 0 ? safeIncome / total : 0;

    drawCircle(config.COLORS.income, -ratio, true);
    drawCircle(config.COLORS.expense, 1 - ratio, false);
  }

  function autoInitChart() {
    const doc = getDocument();

    /* istanbul ignore next */
    if (!doc) return;

    if (doc.querySelector(".chart")) {
      initChart();
    } else if (typeof doc.addEventListener === "function") {
      doc.addEventListener("DOMContentLoaded", initChart, { once: true });
    }
  }

  const api = {
    initChart,
    drawCircle,
    updateChart
  };

  Object.keys(api).forEach(key => {
    root[key] = api[key];
  });

  autoInitChart();

  /* istanbul ignore next */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
/* istanbul ignore next */
})(typeof globalThis !== "undefined" ? globalThis : window);