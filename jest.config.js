// jest.config.js
module.exports = {
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    url: "http://localhost/"
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "budget.js",
    "chart.js",
    "config.js",
    "i18n.js",
    "!tests/**",
    "!coverage/**"
  ],
  coverageDirectory: "coverage"
};