const path = require("path");
const {
  codeCoverageDir,
  istanbulCodeCoverageInstrumentationDir,
} = require("./playwright.shared-vars");

console.log("temp-dir", istanbulCodeCoverageInstrumentationDir);
console.log("report-dir", path.resolve(codeCoverageDir, "reports"))
module.exports = {
  extends: "@istanbuljs/nyc-config-typescript",
  "temp-dir": istanbulCodeCoverageInstrumentationDir, // set to ./tests/test-results/code-coverage/istanbul-instrumentation
  "report-dir": path.resolve(codeCoverageDir, "reports"), // set to ./tests/test-results/code-coverage/reports
  all: true,
  reporter: ["text-summary", "html-spa", "lcovonly", "cobertura"],
};
