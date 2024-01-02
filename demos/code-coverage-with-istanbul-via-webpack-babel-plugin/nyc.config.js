const path = require("path");
const {
  codeCoverageDir,
  istanbulCodeCoverageInstrumentationDir,
} = require("./playwright.shared-vars");

module.exports = {
  extends: "@istanbuljs/nyc-config-typescript",
  "temp-dir": istanbulCodeCoverageInstrumentationDir,
  "report-dir": path.resolve(codeCoverageDir, "reports"),
  all: true,
  reporter: ["html-spa", "lcovonly", "cobertura", "text-summary"],
};
