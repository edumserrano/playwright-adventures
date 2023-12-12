# Run Playwright tests via docker

- [Description](#description)
- [How to build, run the app and run tests](#how-to-build-run-the-app-and-run-tests)

## Description

The demo at [/demos/docker](/demos/docker/) shows how to run Playwright tests in Docker. This is especially useful if you use different Operations Systems between your developer machines and your CI machines. For instance, if you develop on a Windows machine and your CI runs on Linux.

> [!IMPORTANT]
>
> When running Playwright tests in different Operating Systems, if you are doing [Visual Regression Tests](https://playwright.dev/docs/test-snapshots), then the visual comparisons might fail. Usually the failures will be about differences in how different Operating Systems render fonts, even if it's the same font.
>
> From [this GitHub issue comment](https://github.com/microsoft/playwright/issues/23559#issuecomment-1579830160):
>
> "for the ubuntu vs windows: font rendering & font stack resolution is handled by OS, not specced & fundamentally different, so the common agreement as of today is that there's no way to achieve consistent rendering across operating systems. The only way is to use a well-defined consistent execution environment, e.g. VM / containers"
> 
> Alternatively to finding a way to run your tests in the same Operating System as your CI, you could choose to set the [treshold configuration option](https://playwright.dev/docs/api/class-testproject#test-project-expect). Although there's a bit of configuration to do to run the Playwright tests in Docker, I think that's a preferable approach to adding a `treshold` because a `treshold` can make a visual comparison test pass when it shouldn't and lead to false positive tests. Besides `treshold`, configuring `maxDiffPixels` and `maxDiffPixelRatio` might help reduce the false positives.
> 

## How to build, run the app and run tests

> [!IMPORTANT]
>
> To run this demo you must have the following dependencies installed:
> - [Docker](https://www.docker.com/products/docker-desktop/)
> - [latest Powershell](https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell): tested working on `7.4.0`.

1) Clone the repo.
2) Using your favorite shell go to `/demos/docker`.
3) Install the required npm packages with:
    ```
    npm install
    ```
4) Install the [playwright browsers](https://playwright.dev/docs/browsers) with:
    ```
    npx playwright install
    ```
5) Run the tests with:
    ```
    npm test
    ```
    This will start a docker container which will run the app and then run the [playwright tests](/demos/docker/tests/example.spec.ts) against it.
6) If you just want to run the app execute the command:
    ```
    npm start
    ```
    Once the command finishes the app should open in your default browser at [http://127.0.0.1:4200/](http://127.0.0.1:4200/).

