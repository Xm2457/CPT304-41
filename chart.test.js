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

  document.body.innerHTML = `<div class="chart"></div>`;
});

const { drawCircle, updateChart } = require('./chart.js');

describe('chart module tests', () => {
  beforeEach(() => {
    document.body.innerHTML = `<div class="chart"></div>`;
  });

  test('drawCircle does not throw without ctx or canvas', () => {
    expect(() => drawCircle('red', 0.5, true)).not.toThrow();
  });

  test('updateChart clears and draws arcs without errors', () => {
    expect(() => updateChart(100, 50)).not.toThrow();
  });
});