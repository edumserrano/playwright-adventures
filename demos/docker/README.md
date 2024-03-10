# Run Playwright tests via docker

- [Description](#description)
- [How to build, run the app, run tests and view the test results](#how-to-build-run-the-app-run-tests-and-view-the-test-results)
- [Run tests](#run-tests)
  - [What to expect](#what-to-expect)
  - [The Docker setup](#the-docker-setup)
  - [Available options for running tests](#available-options-for-running-tests)
  - [Docker compose file](#docker-compose-file)
  - [Docker command](#docker-command)
- [Run tests with UI mode](#run-tests-with-ui-mode)
  - [What to expect](#what-to-expect-1)
  - [The Docker setup](#the-docker-setup-1)
  - [Available options for running tests](#available-options-for-running-tests-1)
  - [Docker compose file](#docker-compose-file-1)
  - [Docker command](#docker-command-1)
- [Playwright configuration](#playwright-configuration)
- [Other notes on the docker integration](#other-notes-on-the-docker-integration)
  - [File changes aren't triggering an application rebuild when testing with UI mode](#file-changes-arent-triggering-an-application-rebuild-when-testing-with-ui-mode)
  - [When do you need to install node modules on the docker container](#when-do-you-need-to-install-node-modules-on-the-docker-container)
  - [How does the `webServerMode` input parameter of the Powershell scripts work ?](#how-does-the-webservermode-input-parameter-of-the-powershell-scripts-work-)
  - [Why should I use the `webServerMode` input parameter of the Powershell scripts ?](#why-should-i-use-the-webservermode-input-parameter-of-the-powershell-scripts-)
  - [Why are my Playwright tests running in Docker slow?](#why-are-my-playwright-tests-running-in-docker-slow)
  - [Playwright's test execution stops midway when running on Docker](#playwrights-test-execution-stops-midway-when-running-on-docker)
  - [Do I need Powershell to run Playwright in Docker?](#do-i-need-powershell-to-run-playwright-in-docker)
  - [Powershell and passing command line arguments to npm commands](#powershell-and-passing-command-line-arguments-to-npm-commands)
- [Bonus: Visual Studio Code integration](#bonus-visual-studio-code-integration)
  - [Example running the tests using the Visual Studio Code task](#example-running-the-tests-using-the-visual-studio-code-task)
  - [Example running the tests in UI mode using the Visual Studio Code task](#example-running-the-tests-in-ui-mode-using-the-visual-studio-code-task)
  - [Example running the app and then the tests using the Visual Studio tasks](#example-running-the-app-and-then-the-tests-using-the-visual-studio-tasks)
  - [Example debugging the app using Visual Studio Code](#example-debugging-the-app-using-visual-studio-code)

## Description

The demo at [/demos/docker](/demos/docker/) shows how to run Playwright tests in Docker. This is especially useful to eliminate screenshot differences when running the tests across different Operating Systems. For instance, if you develop in Windows but your CI runs on Linux.

> [!IMPORTANT]
>
> When running Playwright tests in different Operating Systems, if you are doing [Visual Regression Tests](https://playwright.dev/docs/test-snapshots), then the visual comparisons might fail. Usually the failures will be about differences in how different Operating Systems render fonts, even if it's the same font.
>
> From [this GitHub issue comment](https://github.com/microsoft/playwright/issues/23559#issuecomment-1579830160):
>
> "for the ubuntu vs windows: font rendering & font stack resolution is handled by OS, not specced & fundamentally different, so the common agreement as of today is that there's no way to achieve consistent rendering across operating systems. The only way is to use a well-defined consistent execution environment, e.g. VM / containers"
>
> Alternatively to finding a way to run your tests in the same Operating System as your CI, you could choose to set the [treshold configuration option](https://playwright.dev/docs/api/class-testproject#test-project-expect). Although there's a bit of configuration to do to run the Playwright tests in Docker, I think that's a preferable approach to adding a `treshold` because a `treshold` can make a visual comparison test pass when it shouldn't and lead to false positive tests. Besides `treshold`, configuring `maxDiffPixels` and `maxDiffPixelRatio` might help reduce the false positives.

## How to build, run the app, run tests and view the test results

> [!IMPORTANT]
>
> Required dependencies:
>
> - [Node](https://nodejs.org/en/blog/release/v20.10.0). Tested working with `v20.10.0`. If you need to have different versions of node installed it's recommended that you use [Node Version Manager](https://github.com/nvm-sh/nvm) to install and swap between node versions.
> - [npm@latest](https://www.npmjs.com/package/npm): package manager used on the demos. Tested working on `10.2.5`.
> - [Git LFS](https://git-lfs.com/): this demo takes screenshots and those images are uploaded to the repo using Git LFS. Without Git LFS you won't get any images when cloning the repo and the Playwright tests will fail. Tested working with `3.3.0`.
> - [latest Powershell](https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell): tested working on `7.4.0`.
> - [Docker](https://www.docker.com/products/docker-desktop/)
> - [VS Code](https://code.visualstudio.com/download) is recommended as a code editor but you can use whatever you prefer.

1. Clone the repo.
2. Using your favorite shell go to `/demos/docker`.
3. Install the required npm packages with:
   ```
   npm install
   ```
4. Install the [playwright browsers](https://playwright.dev/docs/browsers) with:
   ```
   npx playwright install
   ```
5. Run the tests with:
   ```
   npm test
   ```
   This will start a docker container which will run the app and then run the [playwright tests](/demos/docker/tests/example.spec.ts) against it.
6. After running the tests with `npm test` you can view test results with:
   ```
   npm run test:show-report
   ```
7. Run the tests in UI mode with:
   ```
   npm run test:ui
   ```
   This will start a docker container which will run the app and then start [Playwright's UI mode](https://playwright.dev/docs/test-ui-mode). The UI mode will be served from the container and it'll be accessible at `http://localhost:43008`. The UI mode URL will be displayed as part of the output of the `npm run test:ui` command.
8. If you just want to run the app execute the command:
   ```
   npm start
   ```
   Once the command finishes the app should open in your default browser at [http://127.0.0.1:4200/](http://127.0.0.1:4200/).

## Run tests

### What to expect

When you run `npm test` this is what you should expect:

https://github.com/edumserrano/playwright-adventures/assets/15857357/e0de2b19-894f-4e00-8124-f1ddccdd9c35

### The Docker setup

The Docker setup to run Playwright tests uses the [docker-compose.yml](/demos/docker/docker-compose.yml) file. When `npm test` is executed, it runs the [playwright.ps1](/demos/docker/npm-pwsh-scripts/playwright.ps1) pwsh script which sets some environment variables before running the `docker compose up` command.

### Available options for running tests

The `npm test` can be customized with the following parameters:

- `-testOptions`: use this to pass any [Playwright CLI supported test options](https://playwright.dev/docs/test-cli) to the `playwright test` command.

  **Default value**: empty string </br>
  **Example:** `-testOptions '--update-snapshots --grep "load page"'`

- `-webServerMode`: one of `auto`, `from-docker` or `from-host`. Determines if the Playwright tests should be executed against the [Playwright Web Server](https://playwright.dev/docs/test-webserver) running on the host or inside Docker. If you have the target test application running outside of Docker you can set this to `from-host`, otherwise it should be `from-docker`.

  Using `auto` will mean that the pwsh script will attempt to decide if the target test application is running on the host and if so it will use the `from-host` option, if not it will use the `from-docker` option. Setting to `auto` requires setting the `-webServerHost` and `webServerPort` parameters. one of `auto`, `from-docker` or `from-host`.

  **Default value**: `auto`</br>
  **Example**: `-webServerMode from-docker`.

- `-webServerHost`: the host where the Playwright's test target should be running. Required if `-webServerMode auto` is used.

  **Default value**: `127.0.0.1` </br>
  **Example:** `-webServerHost 127.0.0.1`

- `-webServerPort`: the port where the Playwright's test target should be running.

  **Default value**: `4200` </br>
  **Example:** `-webServerPort 4200`

You can combine any of the above parameters. Example:

```
npm test '--' -testOptions '--update-snapshots --grep "load page"' -webServerMode from-docker
```

> [!NOTE]
>
> On the example `npm` command above you only need the single quotes around the double dash if you're running the `npm` command from Powershell. For more info see [Powershell and passing command line arguments to npm commands](#powershell-and-passing-command-line-arguments-to-npm-commands)
>

### Docker compose file

The [docker-compose.yml](/demos/docker/docker-compose.yml) file requires the following environment variables:

| Environment variable name | Description                                                                                                                                                                                                                                                                                               | Default value | Required |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | -------- |
| CI                        | Should be set to `true` if running on a CI environment, `false` otherwise.                                                                                                                                                                                                                                | false         | no       |
| PLAYWRIGHT_VERSION        | Determines the [Playwright's Docker image version](https://hub.docker.com/_/microsoft-playwright). It must match the version of [@playwright/test NPM package](https://www.npmjs.com/package/@playwright/test) that is on the [package.json](/demos//docker/package.json) file.                           | ---           | yes      |
| PLAYWRIGHT_TEST_OPTIONS   | [Playwright CLI test options](https://playwright.dev/docs/test-cli).                                                                                                                                                                                                                                      | ---           | no       |
| NPM_INSTALL_COMMAND       | NPM command to install packages. Usually `npm i` if NOT running in a CI environment and `npm ci` when running on a CI environment.                                                                                                                                                                        | npm i         | no       |
| USE_DOCKER_HOST_WEBSERVER | Determines if the Playwright tests should be executed against the [Playwright Web Server](https://playwright.dev/docs/test-webserver) running on the host or inside Docker. If you have the target test application running outside of Docker you can set this to `true`, otherwise it should be `false`. | false         | no       |


If you want to run the `docker compose up` command without the pwsh script then you can do so by:

1) Go to /demos/docker.
2) Set the required environment variables (see example below).
3) Run `docker compose up`.

To set environment variables for the `docker compose up` command you can either create a `.env` file at `/demos/docker` and populate it. For instance:

```
CI=false
PLAYWRIGHT_VERSION=1.42.1
PLAYWRIGHT_TEST_OPTIONS=
NPM_INSTALL_COMMAND=npm i
USE_DOCKER_HOST_WEBSERVER=false
```

Or you can set them in your shell prior to running the `docker compose up` command. For instance, if you're using Powershell you can do:

```
$env:CI=false
$env:PLAYWRIGHT_VERSION=1.42.1
$env:PLAYWRIGHT_TEST_OPTIONS=
$env:NPM_INSTALL_COMMAND=npm i
$env:USE_DOCKER_HOST_WEBSERVER=false
```

### Docker command

The docker setup to run the Playwright tests is based on the [Playwright Docker docs](https://playwright.dev/docs/docker). When running `npm test`, the [playwright.ps1](/demos/docker/npm-pwsh-scripts/playwright.ps1) Powershell script is executed and runs a `docker compose` command that is equivalent to the following `docker run` command:

```
docker run -it --rm --ipc=host `
--env CI=<true|false> `
--env USE_DOCKER_HOST_WEBSERVER=<true|false> `
--workdir=/app `
-v '<path-to-cloned-repo>\demos\docker:/app' `
-v 'npm-cache:/root/.npm' `
-v 'node-modules:/app/node_modules' `
mcr.microsoft.com/playwright:<@playwright/test-npm-package=-version>-jammy `
/bin/bash -c '<npm i | npm ci> && npx playwright test <test-options>'
```

## Run tests with UI mode

### What to expect

When the docker command to start the [Playwright UI Mode](https://playwright.dev/docs/test-ui-mode#introduction) completes it will display the following message:

```
Listening on http://0.0.0.0:<port>
```

Once you see this message you can access the Playwright UI by going to `http://localhost:<port>`.

When you run `npm run test:ui` this is what you should expect:

https://github.com/edumserrano/playwright-adventures/assets/15857357/cedd5115-f066-49a5-ac61-f4c187a4e27c

### The Docker setup

The Docker setup to run Playwright tests using the UI mode uses the [docker-compose.ui.yml](/demos/docker/docker-compose.ui.yml) file. When `npm run test:ui` is executed, it runs the [playwright.ps1](/demos/docker/npm-pwsh-scripts/playwright.ps1) pwsh script which sets some environment variables before running the `docker compose -f ./docker-compose.ui.yml up` command.

### Available options for running tests

The `npm run test:ui` can be customized with the following parameters:

- `-uiPort`: the port where the UI mode will be available.

  **Default value**: `43008` </br>
  **Example:** `-uiPort 43008`

- `-testOptions`: use this to pass any [Playwright CLI supported test options](https://playwright.dev/docs/test-cli) to the `playwright test` command.

  **Default value**: empty string </br>
  **Example:** `-testOptions --grep "load page"`

- `-fileChangesDetectionSupportMode`: one of `auto`, `supported`, or `unsupported`. Use this to indicate whether or not your Docker setup will be able to support file changes detection. For instance, when running Docker Desktop on Windows under WSL2 you don't have support for file changes detection but you do if you run with WSL1.

  This parameter sets the `FILE_CHANGES_DETECTION_SUPPORTED` environment variable which can be used by the [playwright.config.ts](/demos/docker/playwright.config.ts) to determine if you need to use some sort of polling mechanism for file changes instead of relying on the file system. For example, this demo runs an Angular app and if `FILE_CHANGES_DETECTION_SUPPORTED` is set to false then [playwright.config.ts](/demos/docker/playwright.config.ts) starts the target test Angular app with the `--poll` option so that the app is rebuild when you change the source files.

  When this is set to `auto` the pwsh script will set this to `true` if you're not running on Windows. If you're running on Windows it will set it to true if you're running on WSL1 and to false if you're running on WSL2.

  For more info see the [File changes aren't triggering an application rebuild when testing with UI mode](#file-changes-arent-triggering-an-application-rebuild-when-testing-with-ui-mode) section.

  **Default value**: `auto` </br>
  **Example:** `-fileChangesDetectionSupportMode supported`

- `-webServerMode`: one of `auto`, `from-docker` or `from-host`. Determines if the Playwright tests should be executed against the [Playwright Web Server](https://playwright.dev/docs/test-webserver) running on the host or inside Docker. If you have the target test application running outside of Docker you can set this to `from-host`, otherwise it should be `from-docker`. Using `auto` will mean that the pwsh script will attempt to decide if the target test application is running on the host and if so it will use the `from-host` option, if not it will use the `from-docker` option. Setting to `auto` requires setting the `-webServerHost` and `webServerPort` parameters. one of `auto`, `from-docker` or `from-host`.

  **Default value**: `auto`</br>
  **Example**: `-webServerMode from-docker`.

- `-webServerHost`: the host where the Playwright's test target should be running. Required if `-webServerMode auto` is used.

  **Default value**: `127.0.0.1` </br>
  **Example:** `-webServerHost 127.0.0.1`

- `-webServerPort`: the port where the Playwright's test target should be running.

  **Default value**: `4200` </br>
  **Example:** `-webServerPort 4200`

You can combine any of the above parameters. Example:

```
npm run test:ui '--' -testOptions '--grep "load page"' -webServerMode from-docker -fileChangesDetectionSupportMode unsupported
```

> [!NOTE]
>
> On the example `npm` command above you only need the single quotes around the double dash if you're running the `npm` command from Powershell. For more info see [Powershell and passing command line arguments to npm commands](#powershell-and-passing-command-line-arguments-to-npm-commands)
>

### Docker compose file

The [docker-compose.ui.yml](/demos/docker/docker-compose.ui.yml) file requires the following environment variables:

| Environment variable name        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Default value | Required |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | -------- |
| CI                               | Should be set to `true` if running on a CI environment, `false` otherwise.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | false         | no       |
| PLAYWRIGHT_VERSION               | Determines the [Playwright's Docker image version](https://hub.docker.com/_/microsoft-playwright). It must match the version of [@playwright/test NPM package](https://www.npmjs.com/package/@playwright/test) that is on the [package.json](/demos//docker/package.json) file.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | ---           | yes      |
| PLAYWRIGHT_TEST_OPTIONS          | [Playwright CLI test options](https://playwright.dev/docs/test-cli).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | ---           | no       |
| NPM_INSTALL_COMMAND              | NPM command to install packages. Usually `npm i` if NOT running in a CI environment and `npm ci` when running on a CI environment.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | npm i         | no       |
| USE_DOCKER_HOST_WEBSERVER        | Determines if the Playwright tests should be executed against the [Playwright Web Server](https://playwright.dev/docs/test-webserver) running on the host or inside Docker. If you have the target test application running outside of Docker you can set this to `true`, otherwise it should be `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | false         | no       |
| UI_PORT                          | The port for Playwright's UI Mode. When Playwright UI mode is running you'll be able to access it at http://localhost:<UI_PORT>.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 43008         | no       |
| FILE_CHANGES_DETECTION_SUPPORTED | Determines if you have file change detection support when running in Docker. For instance, when running Docker Desktop on Windows under WSL2 you don't have support for file changes detection but you do if you run with WSL1. </br></br> This environment can be used by the [playwright.config.ts](/demos/docker/playwright.config.ts) to determine if you need to use some sort of polling mechanism for file changes instead of relying on the file system. For example, this demo runs an Angular app and if `FILE_CHANGES_DETECTION_SUPPORTED` is set to false then [playwright.config.ts](/demos/docker/playwright.config.ts) starts the target test Angular app with the `--poll` option so that the app is rebuild when you change the source files. </br></br>For more info see the [File changes aren't triggering an application rebuild when testing with UI mode](#file-changes-arent-triggering-an-application-rebuild-when-testing-with-ui-mode) section. | false         | no       |
| CHOKIDAR_USEPOLLING              | Similar to the `FILE_CHANGES_DETECTION_SUPPORTED` environment variable. This indicates if Playwright's UI Mode needs to poll for test file changes or not. Like with the `FILE_CHANGES_DETECTION_SUPPORTED` environment variable, this varies depending if your Docker setup supports file change detection or not. If not, then set this to `true` so that the UI mode updates when you make changes to the tests. </br></br> For more info see [[Bug]: UI mode in Docker doesn't watch tests #29785](https://github.com/microsoft/playwright/issues/29785).                                                                                                                                                                                                                                                                                                                                                                                                              | true          | no       |

If you want to run the `docker compose up` command without the pwsh script then you can do so by:

1) Go to /demos/docker.
2) Set the required environment variables (see example below).
3) Run `docker compose -f ./docker-compose.ui.yml up`.

To set environment variables for the `docker compose up` command you can either create a `.env` file at `/demos/docker` and populate it. For instance:

```
CI=false
PLAYWRIGHT_VERSION=1.42.1
PLAYWRIGHT_TEST_OPTIONS=
NPM_INSTALL_COMMAND=npm i
USE_DOCKER_HOST_WEBSERVER=false
UI_PORT=43008
FILE_CHANGES_DETECTION_SUPPORTED=false
CHOKIDAR_USEPOLLING=true
```

Or you can set them in your shell prior to running the `docker compose up` command. For instance, if you're using Powershell you can do:

```
$env:CI=false
$env:PLAYWRIGHT_VERSION=1.42.1
$env:PLAYWRIGHT_TEST_OPTIONS=
$env:NPM_INSTALL_COMMAND=npm i
$env:USE_DOCKER_HOST_WEBSERVER=false
$env:UI_PORT=43008
$env:FILE_CHANGES_DETECTION_SUPPORTED=false
$env:CHOKIDAR_USEPOLLING=true
```

### Docker command

The Docker setup to run the Playwright tests in UI mode is based on the [Playwright Docker docs](https://playwright.dev/docs/docker) and [UI Mode > Docker & GitHub Codespaces docs](https://playwright.dev/docs/test-ui-mode#docker--github-codespaces). When running `npm test`, the [playwright.ps1](/demos/docker/npm-pwsh-scripts/playwright.ps1) Powershell script is executed and runs a `docker compose` command that is equivalent to the following `docker run` command:

```
docker run -it --rm --ipc=host `
--env CI=<true|false> `
--env USE_DOCKER_HOST_WEBSERVER=<true|false> `
--env FILE_CHANGES_DETECTION_SUPPORTED=<true|false> `
--env CHOKIDAR_USEPOLLING=<true|false> `
--workdir=/app `
-v '<path-to-cloned-repo>\demos\docker:/app' `
-v 'npm-cache:/root/.npm' `
-v 'node-modules:/app/node_modules' `
mcr.microsoft.com/playwright:<@playwright/test-npm-package=-version>-jammy `
/bin/bash -c '<npm i | npm ci> && npx playwright test --ui-port=<ui-port> --ui-host=0.0.0.0 <test-options>'
```

## Playwright configuration

The majority of the content of the [playwright.config.ts](/demos/docker/playwright.config.ts) file is what you get by default after [adding Playwright to your project](https://playwright.dev/docs/intro#installing-playwright) with `npm init playwright@latest`.

The main changes are:

1. Declared a few variables at the start that are reused throughout the playwright configuration.
2. Updated the `reporter` array. In addition to using the [default html reporter](https://playwright.dev/docs/test-reporters#html-reporter), we've added the [built-in list reporter](https://playwright.dev/docs/test-reporters#list-reporter).
3. Defined a [baseURL](https://playwright.dev/docs/test-webserver#adding-a-baseurl) so that we can use relative URLs when doing page navigations on the tests.
4. Configured the `webServer` block to run the Angular app locally so that the tests can be executed against it. If you're not testing an Angular app that's fine, you just need to adjust the `webServer.command` so that it launches your app and set the `webServer.url` to the url your app will be running at. For more information see the [webServer docs](https://playwright.dev/docs/test-webserver).
5. Defined the `snapshotPathTemplate` option to group snapshots by Operating System. This is a choice for this demo, it's not mandatory. This options is configured so that all snapshots generated on Unix will be stored at `/tests/__screenshots__/linux` and all snapshots generated on Windows will be stored at `/tests/__screenshots__/win32`. One of the reasons this is done is so that we can add the windows directory to the [.gitignore](/demos/docker/.gitignore) to avoid committing windows snapshots in case someone runs the tests outside of Docker for any reason. Remember that the whole point of running in Docker is to generate Unix like snapshots to get consistent behavior between running locally and on CI, so you should never want to commit windows generated snapshots.

> [!NOTE]
>
> The `_isRunningOnCI` variable used on the `playwright.config.ts` changes the value of some options when running tests on CI. To set the `_isRunningOnCI` variable to `true` you must set the environment variable `CI` to `true` before running the tests. For more information regarding using Playwright on a CI environment see [Playwright docs on Continuous Integration](https://playwright.dev/docs/ci).

Furthermore, we have created:

- a [playwright.cli-options.ts](/demos/docker/playwright.cli-options.ts) file: to represent Playwright CLI options we care about.
- a [playwright.env-vars.ts](/demos/docker/playwright.env-vars.ts) file: to represent environment variables we care about.

> [!NOTE]
>
> You don't have to create the `playwright.cli-options.ts` or the `playwright.env-vars.ts` file. You can have all of this on the `playwright.config.ts`. Code structure is up to you.

> [!NOTE]
>
> Depending on your `playwright.config.ts`, make sure you update your `.gitignore` to exclude any directory used by test results, report results, etc. Scroll to the end of this demo's [.gitignore](/demos/docker/.gitignore) to see an example.

## Other notes on the docker integration

### File changes aren't triggering an application rebuild when testing with UI mode

> [!NOTE]
>
> Almost sure you can ignore this section if you're not using a Windows OS.

> [!IMPORTANT]
>
> This demo solves this issue by allowing you to set the `--poll` option of the [Angular CLI ng serve command](https://angular.io/cli/serve) via an extra parameter that can be passed into the `npm run test:ui` npm script. Check the `fileChangesDetectionSupportMode` option on the [Run tests with UI mode > Available options for running tests](#available-options-for-running-tests-1) section.

When running tests in UI mode you always want the app to rebuild when you change the code so that you can run tests on your latest changes.

However, there might be cases where the app doesn't rebuild when you change the code. For instance, if you're running Docker Desktop using WSL2 then you might not get file change support. As an example, for Angular apps the default watch mode will not work.

The root cause for this is explained by:

> In cases where Angular CLI is running in a shared directory on linux VM on a windows host the webpack dev server isn't detecting file changes from the host environment. (ex: Whenever a docker dev environment is running on a windows host.)
> This is solved by adding poll option to the webpack dev server configuration. By default when no poll interval is set watchpack will use native file system change detection. This change allows for setting the poll interval which will turn on polling. [^1]

[^1]: [feat(webpackDevServer): Add watchOptions for webpackDevServer #1814](https://github.com/angular/angular-cli/pull/1814#issuecomment-241854816)

Although the comment above comes from an issue in the Angular CLI, the described root cause can apply to apps running on other technologies such as `React`, `Vue`, `dotnet`, etc.

As a workaround to forcing file changes polling, which for `Angular` can be done with the [--poll option](https://angular.io/cli/serve), you can also:

> For some reason nodemon and webpack-dev-server hot reload does not work in WSL2. Downgrading to WSL 1 resolved the issue.
>
> In order for this to work in WSL 2, the project needs to be inside the linux file system. [^2]

[^2]: [Nodemon and webpack-dev-server hot reload not working under WSL 2 after Windows 10 resinstall](https://stackoverflow.com/a/62790703)

The last alternative I can provide to this issue is to run the target test app outside of Docker and then use the `-webServerMode from-host` option in combination with `-webServerMode` and `-webServerPort`. Example:

```
npm run test:ui '--' -webServerMode from-host -webServerHost 127.0.0.1 -webServerPort 4200
```

Since the app is running outside of Docker the file change detection will work as usual and the `-webServerMode from-host` will make the tests running on Docker execute against the instance of the app running on the host. For more information on the `-webServerMode from-host` see the [Why should I use the `webServerMode` input parameter of the Powershell scripts ?](#why-should-i-use-the-webservermode-input-parameter-of-the-powershell-scripts-) section.

### When do you need to install node modules on the docker container

You need to install the NPM packages in the docker container **if** your project depends on NPM packages which install different binaries depending on the OS **and** you are running the tests from a Windows OS.

**Otherwise**, you will get an error when the Playwright's WebServer tries to start the app inside the docker container. The error will tell you that your app failed to start using the node modules that you mounted into the container, because at least one of the NPM packages contains a binary that was built for another platform.

Here's an example of the error message:

> [WebServer] An unhandled exception occurred:
> You installed esbuild for another platform than the one you're currently using.
> This won't work because esbuild is written with native code and needs to
> install a platform-specific binary executable.
>
> Specifically the "@esbuild/win32-x64" package is present but this platform
> needs the "@esbuild/linux-x64" package instead. People often get into this
> situation by installing esbuild on Windows or macOS and copying "node_modules"
> into a Docker image that runs Linux, or by copying "node_modules" between
> Windows and WSL environments.
>
> If you are installing with npm, you can try not copying the "node_modules"
> directory when you copy the files over, and running "npm ci" or "npm install"
> on the destination platform after the copy. Or you could consider using yarn
> instead of npm which has built-in support for installing a package on multiple
> platforms simultaneously.
>
> If you are installing with yarn, you can try listing both this platform and the
> other platform in your ".yarnrc.yml" file using the "supportedArchitectures"
> feature: https://yarnpkg.com/configuration/yarnrc/#supportedArchitectures
> Keep in mind that this means multiple copies of esbuild will be present.
>
> Another alternative is to use the "esbuild-wasm" package instead, which works
> the same way on all platforms. But it comes with a heavy performance cost and
> can sometimes be 10x slower than the "esbuild" package, so you may also not
> want to do that.

To avoid this error, the [playwright.ps1](/demos/docker/npm-pwsh-scripts/playwright.ps1) Powershell script provides the `-installNpmPackagesMode` input parameter. If set to `auto` it will override the `node_modules` folder that is mounted into the docker container and install the NPM packages if the host Operating System is Windows, otherwise it will use what was mounted from the host. If set to `install` it will always install the NPM packages and if set to `mount` it will always use the mounted NPM packages. Example:

```
npm test '--' -installNpmPackagesMode mount
```

> [!NOTE]
>
> The Angular app used for this demo depends on the [esbuild npm package](https://www.npmjs.com/package/esbuild) which installs Operating System specific binaries.

> [!WARNING]
>
> This code demo doesn't have to deal with private NPM registries, but if you are using private registries **and** you need to install the NPM packages in the container, then you will have to extend this demo to pass the NPM authentication to the docker container.
>
> For more info see:
>
> - [Using private packages in a CI/CD workflow](https://docs.npmjs.com/using-private-packages-in-a-ci-cd-workflow)
> - [Using auth tokens in .npmrc](https://stackoverflow.com/questions/53099434/using-auth-tokens-in-npmrc)

### How does the `webServerMode` input parameter of the Powershell scripts work ?

If you set `webServerMode` to `from-host` with `npm test '--' -webServerMode from-host` or with `npm run test:ui '--' -webServerMode from-host` then the docker container won't have to build and run your app and instead will try to connect to the app running on the host machine.

This is due to the `webServer.reuseExistingServer` option of the [playwright.config.ts](/demos/docker/playwright.config.ts). When this is set to `true` then Playwright will check if the app is running on the `webServer.url` address and if it is then it just uses that as the target of the tests.

The trick to make this work though is that the `webServer.url` must be set to an address that is reachable from the docker container. And since what we want to do is to reach the app that is running on the host then what the `playwright.config.ts` does is set the host of the `webServer.url` to `host.docker.internal`. Furthermore, the docker container must run with the following extra host `host.docker.internal:host-gateway`. For more info see [](https://forums.docker.com/t/how-to-reach-localhost-on-host-from-docker-container/113321).

For more info see:

- [I want to connect from a container to a service on the host](https://docs.docker.com/desktop/networking/#i-want-to-connect-from-a-container-to-a-service-on-the-host)
- [How to connect to the Docker host from inside a Docker container?](https://medium.com/@TimvanBaarsen/how-to-connect-to-the-docker-host-from-inside-a-docker-container-112b4c71bc66)

### Why should I use the `webServerMode` input parameter of the Powershell scripts ?

If you set the `-webServerMode` to `from-host` with `npm test '--' -webServerMode from-docker` or with `npm run test:ui '--' -webServerMode from-host` then the docker container won't have to build and run your app and instead will try to connect to the app running on the host machine.

This means that you can start the app once with `npm start` and then run the tests against it multiple times with `npm test`. Depending on your app, skipping the building and running of the app as well as the node modules install if needed as well, might result in a non-trivial time saving for your dev loop.

> [!TIP]
>
> For most of the time I suggest using the `npm test:ui` for your dev loop. This command will also only and run the app once and then the UI mode will run the tests against it. When you do changes on the app or the tests everything is hot reloaded and you can keep developing and running the tests as you go.

### Why are my Playwright tests running in Docker slow?

This shouldn't be the case. In my experience, Playwright runs quicker in the `mcr.microsoft.com/playwright` docker image than outside of docker, especially if you're running on Windows.

The issue that you might be facing though is something that I've encountered on a setup where I was mounting the `node_modules` directory into the container and that was affecting the filesystem performance. The Docker compose files used by this demo creates a named volume for the `node_modules` to avoid this problem occurring with the `node_modules` directory.

However, if you're using Windows and you're mounting a large number of files to the docker container then you might want to try using WSL1 as your Docker's engine.

For more information see [microsoft/WSL [wsl2] filesystem performance is much slower than wsl1 in /mnt #4197](https://github.com/microsoft/WSL/issues/4197), more specifically [this comment](https://github.com/microsoft/WSL/issues/4197#issuecomment-604592340).

> [!TIP]
>
> If you're using [Docker for Desktop](https://www.docker.com/products/docker-desktop/) switching the Docker engine can easily be done in the `General settings`. You can always toggle back to WSL2 at any time.
>
> Toggling off WSL2 use on `Docker for Desktop` on Windows, means Docker will use Hyper-V. [You might have to enabled it](https://learn.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v#enable-hyper-v-using-powershell).

### Playwright's test execution stops midway when running on Docker

If the tests' execution fails midway when running on Docker, it might be due to low memory available to the Docker container. Try increasing the memory limits set for Docker.

> [!TIP]
>
> You should consider increasing the CPU and memory resources given to Docker to improve the Playwright's test execution speed. Especially the CPU resources because Playwright will try to [parallelize the test execution according to the number of available CPUs](https://playwright.dev/docs/test-parallel).

### Do I need Powershell to run Playwright in Docker?

No, this demo used Powershell to create a script with the logic to build the docker commands but you don't need it. Hopefully this demo explained the required building blocks and you can use them as you wish to create your docker commands.

### Powershell and passing command line arguments to npm commands

You can use the `--` notation to [pass command line arguments to npm commands](https://dev.to/felipperegazio/handling-command-line-arguments-in-npm-scripts-2ean). However, if you're using Powershell and want to pass command line arguments to npm commands, then you should either use a double `-- --` notation or single quotes like `'--'`. Example:

```
npm test '--' -testOptions '--update-snapshots'
```

Fore more info see:

- [PowerShell, NPM Scripts, and Silently Dropped Arguments](https://www.lloydatkinson.net/posts/2022/powershell-npm-scripts-and-silently-dropped-arguments/).
- [[BUG] Arguments are not correctly passed from CLI to npm script (npm 7, Windows, Powershell) #3136](https://github.com/npm/cli/issues/3136#issuecomment-948544220)

## Bonus: Visual Studio Code integration

This code demo also shows how you can improve your Visual Studio Code integration by configuring custom [tasks](/demos/docker/.vscode/tasks.json) to help you build and run both the app and the tests.

The available tasks are:

- `install packages`: installs npm packages.
- `run app`: builds and runs the app.
- `run tests`: runs the Playwright tests in a docker container.
- `run tests ui`: runs the Playwright tests in a docker container using UI mode.
- `show tests report`: opens the test results report.

**To get access to these tasks make sure you open the `/demos/docker/` folder in Visual Studio Code.**

> [!TIP]
>
> You can run Visual Studio Code tasks through Quick Open (Ctrl+P) by typing 'task', Space and the command name. For more info see [Integrate with External Tools via Tasks](https://code.visualstudio.com/docs/editor/tasks).

### Example running the tests using the Visual Studio Code task

When you run the `run tests` task you will be prompted for some input which is then passed on to the [playwright-vscode-task.ps1](/npm-pwsh-scripts/playwright-vscode-task.ps1) Powershell script.

https://github.com/edumserrano/playwright-adventures/assets/15857357/204e5a7e-c098-4823-bf0e-36f240620f22

### Example running the tests in UI mode using the Visual Studio Code task

When you run the `run tests ui` task you will be prompted for some input which is then passed on to the [playwright-vscode-task.ps1](/npm-pwsh-scripts/playwright-vscode-task.ps1) Powershell script.

https://github.com/edumserrano/playwright-adventures/assets/15857357/923f30a0-27ad-4197-bb12-557c8746e688

### Example running the app and then the tests using the Visual Studio tasks

If you have the target test app running before you run the `run tests` task or `run tests ui` task and choose `auto` or `from-host` to the `Which Playwright Web Server to use?` prompt, notice that the docker container won't have to install packages nor build and run the app. It immediately starts to run the tests against the the target test app that is running on the host.

https://github.com/edumserrano/playwright-adventures/assets/15857357/f4c6bbad-ce61-4400-a1a8-3a94a32ba107

### Example debugging the app using Visual Studio Code

Although this is not related with running Playwright in docker, this demo also shows how you can configure a [launch task](/demos/docker/.vscode/launch.json) for Visual Studio Code that let's you debug the app in Visual Studio Code.

https://github.com/edumserrano/playwright-adventures/assets/15857357/db540972-f60c-4a1a-9f08-d61c38af28ec
