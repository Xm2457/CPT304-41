// tests/chart.test.js

describe("chart.js", () => {
  let mockCtx;

  function mockCanvasContext(returnValue) {
    mockCtx = {
      beginPath: jest.fn(),
      arc: jest.fn(),
      stroke: jest.fn(),
      clearRect: jest.fn(),
      lineWidth: 0,
      strokeStyle: ""
    };

    jest
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue(returnValue === undefined ? mockCtx : returnValue);

    return mockCtx;
  }

  function loadChartWithDom(html = `<div class="chart"></div>`, config) {
    jest.resetModules();

    document.body.innerHTML = html;

    global.CONFIG = config || require("../config.js");

    mockCanvasContext();

    return require("../chart.js");
  }

  afterEach(() => {
    jest.restoreAllMocks();
    document.body.innerHTML = "";
    delete global.CONFIG;
  });

  test("initializes canvas inside .chart container", () => {
    loadChartWithDom();

    const canvas = document.querySelector(".chart canvas");

    expect(canvas).not.toBeNull();
    expect(canvas.width).toBe(50);
    expect(canvas.height).toBe(50);
    expect(canvas.dataset.budgetChart).toBe("true");
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith("2d");
    expect(mockCtx.lineWidth).toBe(8);
  });

  test("initChart replaces old budget chart canvas when called again", () => {
    const { initChart } = loadChartWithDom();

    const firstCanvas = document.querySelector(".chart canvas");

    expect(firstCanvas).not.toBeNull();

    initChart();

    const canvases = document.querySelectorAll(".chart canvas");

    expect(canvases.length).toBe(1);
    expect(canvases[0]).not.toBe(firstCanvas);
    expect(canvases[0].dataset.budgetChart).toBe("true");
  });

  test("updateChart clears canvas and draws income and expense circles", () => {
    const { updateChart } = loadChartWithDom();

    updateChart(100, 50);

    expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, 50, 50);
    expect(mockCtx.beginPath).toHaveBeenCalledTimes(2);
    expect(mockCtx.arc).toHaveBeenCalledTimes(2);
    expect(mockCtx.stroke).toHaveBeenCalledTimes(2);
  });

  test("updateChart handles invalid income and outcome safely", () => {
    const { updateChart } = loadChartWithDom();

    updateChart("abc", null);

    expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, 50, 50);
    expect(mockCtx.arc).toHaveBeenCalledTimes(2);
    expect(mockCtx.stroke).toHaveBeenCalledTimes(2);
  });

  test("updateChart handles zero total safely", () => {
    const { updateChart } = loadChartWithDom();

    updateChart(0, 0);

    expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, 50, 50);
    expect(mockCtx.arc).toHaveBeenCalledTimes(2);
    expect(mockCtx.stroke).toHaveBeenCalledTimes(2);

    const firstArcCall = mockCtx.arc.mock.calls[0];
    const secondArcCall = mockCtx.arc.mock.calls[1];

    expect(firstArcCall[4]).toBeCloseTo(0);
    expect(firstArcCall[5]).toBe(true);

    expect(secondArcCall[4]).toBe(2 * Math.PI);
    expect(secondArcCall[5]).toBe(false);
  });

  test("initChart returns false when .chart container is missing", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const { initChart, updateChart } = loadChartWithDom(`<div></div>`);

    expect(initChart()).toBe(false);
    expect(() => updateChart(100, 50)).not.toThrow();

    expect(warnSpy).toHaveBeenCalledWith("Chart container or CONFIG.CHART not found.");
  });

  test("initChart returns false when CONFIG is missing", () => {
    jest.resetModules();

    document.body.innerHTML = `<div class="chart"></div>`;
    delete global.CONFIG;

    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const { initChart } = require("../chart.js");

    expect(initChart()).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith("Chart container or CONFIG.CHART not found.");
  });

  test("initChart returns false when CONFIG.CHART is missing", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const configWithoutChart = {
      COLORS: {
        income: "#FFFFFF",
        expense: "#F0624D"
      }
    };

    const { initChart } = loadChartWithDom(
      `<div class="chart"></div>`,
      configWithoutChart
    );

    expect(initChart()).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith("Chart container or CONFIG.CHART not found.");
  });

  test("initChart returns false when canvas context is not available", () => {
    jest.resetModules();

    document.body.innerHTML = `<div class="chart"></div>`;
    global.CONFIG = require("../config.js");

    jest
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue(null);

    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const { initChart } = require("../chart.js");

    expect(initChart()).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith("Failed to get 2D context for canvas.");
  });

  test("drawCircle does nothing before chart is initialized", () => {
    jest.resetModules();

    document.body.innerHTML = `<div></div>`;
    global.CONFIG = require("../config.js");

    mockCanvasContext();

    const { drawCircle } = require("../chart.js");

    expect(() => drawCircle("#FFFFFF", 0.5, true)).not.toThrow();
    expect(mockCtx.arc).not.toHaveBeenCalled();
  });

  test("updateChart does nothing before chart is initialized", () => {
    jest.resetModules();

    document.body.innerHTML = `<div></div>`;
    global.CONFIG = require("../config.js");

    mockCanvasContext();

    const { updateChart } = require("../chart.js");

    expect(() => updateChart(100, 50)).not.toThrow();
    expect(mockCtx.clearRect).not.toHaveBeenCalled();
    expect(mockCtx.arc).not.toHaveBeenCalled();
  });

  test("updateChart does nothing when CONFIG.COLORS is missing", () => {
    const configWithoutColors = {
      CHART: {
        WIDTH: 50,
        HEIGHT: 50,
        RADIUS: 20,
        LINE_WIDTH: 8
      }
    };

    const { updateChart } = loadChartWithDom(
      `<div class="chart"></div>`,
      configWithoutColors
    );

    updateChart(100, 50);

    expect(mockCtx.clearRect).not.toHaveBeenCalled();
    expect(mockCtx.arc).not.toHaveBeenCalled();
    expect(mockCtx.stroke).not.toHaveBeenCalled();
  });

  test("autoInitChart registers DOMContentLoaded when .chart is not found", () => {
    jest.resetModules();

    document.body.innerHTML = `<div></div>`;
    global.CONFIG = require("../config.js");

    const addEventSpy = jest.spyOn(document, "addEventListener");

    mockCanvasContext();

    require("../chart.js");

    expect(addEventSpy).toHaveBeenCalledWith(
      "DOMContentLoaded",
      expect.any(Function),
      { once: true }
    );
  });

  test("autoInitChart initializes immediately when .chart exists", () => {
    loadChartWithDom(`<div class="chart"></div>`);

    expect(document.querySelector(".chart canvas")).not.toBeNull();
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith("2d");
  });
});