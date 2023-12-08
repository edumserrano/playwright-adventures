// This file is used to add code coverage instrumentation via istanbul
// when running the app in development configuration.
//
// This file is referenced on the angular.json at for this app at
// /demos/code-coverage-with-istanbul-via-webpack-babel-plugin/angular.json
// by the customWebpackConfig property. Fore more info see:
// - https://www.npmjs.com/package/@angular-builders/custom-webpack
//
const path = require("path");

// __dirname is the current directory for this file which is at
// demos\code-coverage-with-istanbul-via-webpack-babel-plugin\tests\_shared\coverage.webpack.js
// and we want to get code coverage for the files under
// demos\code-coverage-with-istanbul-via-webpack-babel-plugin\src
var sourceFolderPath = path.join(__dirname, "..", "..", "src");
module.exports = {
  module: {
    rules: [
      {
        test: /\.(ts)$/,
        use: {
          loader: "babel-loader",
          options: {
            plugins: ["babel-plugin-istanbul"],
          },
        },
        enforce: "post",
        include: sourceFolderPath,
        exclude: [/node_modules/],
      },
    ],
  },
};
