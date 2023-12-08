# Playwright code coverage with monocart-reporter

- [Description](#description)
- [How to build, run the app and run tests](#how-to-build-run-the-app-and-run-tests)
- [More info](#more-info)

## Description

The demo at [/demos/code-coverage-with-monocart-reporter](/demos/code-coverage-with-monocart-reporter/) shows how to get code coverage with Playwright by using the [monocart-reporter](https://www.npmjs.com/package/monocart-reporter) npm package.

## How to build, run the app and run tests

1) Clone the repo.
2) Using your favorite shell go to `/demos/code-coverage-with-monocart-reporter`.
3) To install the required npm packages execute the command:
    ```
    npm install
    ```
4) To run the app execute the command:
    ```
    npm start
    ```
    Once the command finishes the app should open in your default browser at [http://127.0.0.1:4200/](http://127.0.0.1:4200/).
5) To run the tests execute the command:
    ```
    npm test
    ```
    This will start the app and run the [playwright tests](/demos/code-coverage-with-monocart-reporter/tests/example.spec.ts) against it.

## More info

