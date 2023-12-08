"use strict";

const path = require('path');
const testResultsVars = require("./test-results-vars.json");

module.exports = {
  extends: "@istanbuljs/nyc-config-typescript",
  "temp-dir": testResultsVars['istanbul-code-coverage-instrumentation-dir'], // set to ./tests/test-results/code-coverage/istanbul-instrumentation
  "report-dir": path.resolve(testResultsVars['code-coverage-dir'], "reports"), // set to ./tests/test-results/code-coverage/reports
  all: true,
  reporter: ["html-spa", "lcovonly", "cobertura"],
};
