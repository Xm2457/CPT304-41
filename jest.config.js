module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    "*.js"   
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
};