const path = require('path');

const testsDir = path.resolve('./tests'); // set to ./tests
const testsResultsDir = path.resolve(testsDir, 'test-results'); // set to ./tests/test-results
const codeCoverageDir = path.resolve(testsResultsDir, "code-coverage"); // set to ./tests/test-results/code-coverage
const istanbulCodeCoverageInstrumentationDir = path.resolve(codeCoverageDir, "istanbul-instrumentation"); // set to ./tests/test-results/code-coverage/istanbul-instrumentation

module.exports = {
  testsDir,
  testsResultsDir,
  codeCoverageDir,
  istanbulCodeCoverageInstrumentationDir,
}
