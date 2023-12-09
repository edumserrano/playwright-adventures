const path = require("path");
const {
  codeCoverageDir,
  istanbulCodeCoverageInstrumentationDir,
} = require("./playwright.shared-vars");

module.exports = {
  extends: "@istanbuljs/nyc-config-typescript",
  "temp-dir": istanbulCodeCoverageInstrumentationDir, // set to ./tests/test-results/code-coverage/istanbul-instrumentation
  "report-dir": path.resolve(codeCoverageDir, "reports"), // set to ./tests/test-results/code-coverage/reports
  all: true,
  reporter: ["html-spa", "lcovonly", "cobertura", "text-summary"],
};
