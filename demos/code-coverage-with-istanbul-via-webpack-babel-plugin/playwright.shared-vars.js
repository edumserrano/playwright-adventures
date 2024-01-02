const path = require("path");

const testsDir = path.resolve("./tests");
const testsResultsDir = path.resolve("./test-results");
const codeCoverageDir = path.resolve(testsResultsDir, "code-coverage");
const istanbulCodeCoverageInstrumentationDir = path.resolve(
  codeCoverageDir,
  "istanbul-instrumentation",
);

module.exports = {
  testsDir,
  testsResultsDir,
  codeCoverageDir,
  istanbulCodeCoverageInstrumentationDir,
};
