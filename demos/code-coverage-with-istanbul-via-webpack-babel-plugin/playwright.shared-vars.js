const path = require('path');

const testsDir = path.resolve('./tests'); // set to ./tests
const testsResultsDir = path.resolve('test-results'); // set ./test-results
const codeCoverageDir = path.resolve(testsResultsDir, "code-coverage"); // set to ./test-results/code-coverage
const istanbulCodeCoverageInstrumentationDir = path.resolve(codeCoverageDir, "istanbul-instrumentation"); // set to ./test-results/code-coverage/istanbul-instrumentation

module.exports = {
  testsDir,
  testsResultsDir,
  codeCoverageDir,
  istanbulCodeCoverageInstrumentationDir,
}
