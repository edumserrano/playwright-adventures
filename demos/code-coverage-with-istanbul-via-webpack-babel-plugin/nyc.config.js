const path = require("path");
const {
  codeCoverageDir,
  istanbulCodeCoverageInstrumentationDir,
} = require("./test-results-vars");

module.exports = {
  extends: "@istanbuljs/nyc-config-typescript",
  "temp-dir": istanbulCodeCoverageInstrumentationDir, // set to ./tests/test-results/code-coverage/istanbul-instrumentation
  "report-dir": path.resolve(codeCoverageDir, "reports"), // set to ./tests/test-results/code-coverage/reports
  all: true,
  reporter: ["text-summary", "html-spa", "lcovonly", "cobertura"],
};
