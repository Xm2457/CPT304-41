/**
 * @jest-environment jsdom
 */

beforeEach(() => {
  global.CONFIG = {
    CHART: {
      WIDTH: 50,
      HEIGHT: 50,
      RADIUS: 20,
      LINE_WIDTH: 8,
    },
    COLORS: {
      income: '#FFFFFF',
      expense: '#F0624D',
    },
  };

  // 预置 DOM，保证模块加载时能找到 .chart 容器
  document.body.innerHTML = `<div class="chart"></div>`;
});

describe('chart module tests', () => {
  let chartModule;

  beforeEach(() => {
    jest.resetModules();
    chartModule = require('./chart.js');
  });

  test('module exports drawCircle and updateChart functions', () => {
    expect(typeof chartModule.drawCircle).toBe('function');
    expect(typeof chartModule.updateChart).toBe('function');
  });

  test('drawCircle does not throw without ctx or canvas', () => {
    // 强制删除内部 ctx 和 canvas 模拟无画布情况
    chartModule.ctx = null;
    chartModule.canvas = null;
    expect(() => chartModule.drawCircle('red', 0.5, true)).not.toThrow();
  });

  test('updateChart clears and draws arcs without errors', () => {
    expect(() => chartModule.updateChart(100, 50)).not.toThrow();
  });

  test('updateChart handles zero total gracefully', () => {
    expect(() => chartModule.updateChart(0, 0)).not.toThrow();
  });

  test('updateChart handles invalid input gracefully', () => {
    expect(() => chartModule.updateChart(null, undefined)).not.toThrow();
    expect(() => chartModule.updateChart(NaN, NaN)).not.toThrow();
  });

  test('warns if no chart container or CONFIG.CHART', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    // 破坏条件，删除容器和配置
    document.body.innerHTML = '';
    const oldConfig = global.CONFIG;
    delete global.CONFIG.CHART;

    jest.resetModules();
    require('./chart.js');

    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
    global.CONFIG = oldConfig;
  });
});