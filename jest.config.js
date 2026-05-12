module.exports = {
  testEnvironment: "jsdom",
  collectCoverage: true,
  collectCoverageFrom: [
    "*.js"   
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
};