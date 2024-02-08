# Run Playwright tests via docker

- [Description](#description)
- [How to build, run the app, run tests and view the test results](#how-to-build-run-the-app-run-tests-and-view-the-test-results)
- [Run tests](#run-tests)
  - [What to expect](#what-to-expect)
  - [The docker command to run Playwright tests](#the-docker-command-to-run-playwright-tests)
  - [Available options for running tests](#available-options-for-running-tests)
- [Run tests with UI mode](#run-tests-with-ui-mode)
  - [What to expect](#what-to-expect-1)
  - [The docker command to run Playwright tests with UI mode](#the-docker-command-to-run-playwright-tests-with-ui-mode)
  - [Available options for running tests with UI mode](#available-options-for-running-tests-with-ui-mode)
- [playwright.ps1 Powershell script details](#playwrightps1-powershell-script-details)
- [Playwright configuration](#playwright-configuration)
- [Other notes on the docker integration](#other-notes-on-the-docker-integration)
  - [File changes aren't triggering an application rebuild when testing with UI mode](#file-changes-arent-triggering-an-application-rebuild-when-testing-with-ui-mode)
  - [When do you need to install node modules on the docker container](#when-do-you-need-to-install-node-modules-on-the-docker-container)
  - [I want to use more of the Playwright test CLI options](#i-want-to-use-more-of-the-playwright-test-cli-options)
  - [How does the `useHostWebServer` input parameter of the Powershell scripts work ?](#how-does-the-usehostwebserver-input-parameter-of-the-powershell-scripts-work-)
  - [Why should I use the `useHostWebServer` input parameter of the Powershell scripts ?](#why-should-i-use-the-usehostwebserver-input-parameter-of-the-powershell-scripts-)
  - [Why are my Playwright tests running in Docker slow?](#why-are-my-playwright-tests-running-in-docker-slow)
  - [Playwright's test execution stops midway when running on Docker](#playwrights-test-execution-stops-midway-when-running-on-docker)
  - [Do I need Powershell to run Playwright in Docker?](#do-i-need-powershell-to-run-playwright-in-docker)
  - [Powershell and passing command line arguments to npm commands](#powershell-and-passing-command-line-arguments-to-npm-commands)
- [Bonus: Visual Studio Code integration](#bonus-visual-studio-code-integration)
  - [Example running the tests using the Visual Studio Code task](#example-running-the-tests-using-the-visual-studio-code-task)
  - [Example running the tests using the Visual Studio task and setting `useHostWebServer` to `yes`](#example-running-the-tests-using-the-visual-studio-task-and-setting-usehostwebserver-to-yes)
  - [Example running the tests in UI mode using the Visual Studio Code task](#example-running-the-tests-in-ui-mode-using-the-visual-studio-code-task)
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
   This will start a docker container which will run the app and then start [Playwright's UI mode](https://playwright.dev/docs/test-ui-mode). The UI mode will be served from the container and it'll be acessible at `http://localhost:<random-port>`. The UI mode URL will be displayed as part of the output of the `npm run test:ui` command.
8. If you just want to run the app execute the command:
   ```
   npm start
   ```
   Once the command finishes the app should open in your default browser at [http://127.0.0.1:4200/](http://127.0.0.1:4200/).

## Run tests

### What to expect

When you run `npm test` this is what you should expect:

https://github.com/edumserrano/playwright-adventures/assets/15857357/e0de2b19-894f-4e00-8124-f1ddccdd9c35

### The docker command to run Playwright tests

The docker setup to run the Playwright tests is based on the [Playwright Docker docs](https://playwright.dev/docs/docker). When running `npm test`, the [playwright.ps1](/demos/docker/npm-pwsh-scripts/playwright.ps1) Powershell script is executed and builds the following docker command to run the Playwright tests:

```
docker run -it --rm --ipc=host --env CI=False --workdir=/app -v '<path-to-cloned-repo>\demos\docker:/app' -v '/app/node_modules' mcr.microsoft.com/playwright:v1.40.1-jammy /bin/bash -c 'npm ci && npx playwright test'
```

Let's analyse the docker command:

- the `-it`: instructs Docker to allocate a pseudo-TTY connected to the container's stdin; creating an interactive bash shell in the container. The main reason this flag is used is to be able to abort the docker command by using `CTRL+C`.
- the `--rm`: automatically removes the container when it exits.
- the `--ipc=host`: is recommended when using Chrome ([Docker docs](https://docs.docker.com/engine/reference/run/#ipc-settings---ipc)). Chrome can run out of memory without this flag.
- the `--env CI=False`: is setting an environment variable that will then be used by the [playwright.config.ts](/demos/docker/playwright.config.ts) to set the `_isRunningOnCI` variable.
- the `--workdir=/app`: sets the working directory inside the container. It's set to be the directory where the app code will be mounted.
- the `-v '<path-to-cloned-repo>\demos\docker:/app'`: mounts the contents of the folder `<path-to-cloned-repo>\demos\docker` into the docker container at `/app`.
- the `-v '/app/node_modules'`: is a way to exclude the `node_modules` folder from the mounted folder above. See [How to Mount a Docker Volume While Excluding a Subdirectory](https://www.howtogeek.com/devops/how-to-mount-a-docker-volume-while-excluding-a-subdirectory/).
- the `mcr.microsoft.com/playwright:v1.40.1-jammy`: is the name and tag of the docker image to run. The tag used needs to match the same version of the `@playwright/test` npm package used by the app.
- the `/bin/bash -c 'npm ci && npx playwright test'`: is the command that the docker image will execute. This command will run `npm ci` to install all the required packages and then runs the Playwright tests with `npx playwright test`.

### Available options for running tests

> [!NOTE]
>
> For a description of the options see the [playwright.ps1 Powershell script details](#playwrightps1-powershell-script-details) section.

The `npm test` can be customized with the following options:

- `useHostWebServer`: setting `-useHostWebServer` enables this option.
- `-updateSnapshots`: setting `-updateSnapshots` enables this option.
- `-grep`: free text. Example: `-grep 'checkout tests'`.
- `installNpmPackagesMode`: one of `auto`, `install` or `mount`. Example: `-installNpmPackagesMode install`.

You can combine any of the options. Examples:

```
npm test '--' -useHostWebServer

npm test '--' -useHostWebServer -updateSnapshots

npm test '--' -installNpmPackagesMode auto -grep 'login'
```

> [!NOTE]
>
> On the example `npm` commands above you only need the single quotes around the double dash if you're running the `npm` command from Powershell. For more info see [Powershell and passing command line arguments to npm commands](#powershell-and-passing-command-line-arguments-to-npm-commands)

## Run tests with UI mode

### What to expect

When the docker command to start the Playwright UI completes it will display the following message:

```
Listening on http://0.0.0.0:<port>
```

Once you see this message you can access the Playwright UI by going to `http://localhost:<port>`.

When you run `npm run test:ui` this is what you should expect:

https://github.com/edumserrano/playwright-adventures/assets/15857357/cedd5115-f066-49a5-ac61-f4c187a4e27c

### The docker command to run Playwright tests with UI mode

The docker setup to run the tests with the Playwright UI mode is based on the [Playwright Docker docs](https://playwright.dev/docs/docker) and the [Playwright Docker & GitHub Codespaces docs](https://playwright.dev/docs/test-ui-mode#docker--github-codespaces). When running `npm run test:ui`, the [playwright.ps1](/demos/docker/npm-pwsh-scripts/playwright.ps1) Powershell script is executed and builds the following docker command to run the Playwright UI mode:

```
docker run -it --rm --ipc=host --env FILE_CHANGES_DETECTION_SUPPORTED=true --workdir=/app -p <host-port>:<container-port> -v '<path-to-cloned-repo>\demos\docker:/app' -v '/app/node_modules' mcr.microsoft.com/playwright:v1.40.1-jammy /bin/bash -c 'npm ci && npx playwright test --ui-port=<container-port> --ui-host=0.0.0.0'
```

Let's analyse the docker command:

- the `-it`: instructs Docker to allocate a pseudo-TTY connected to the container's stdin; creating an interactive bash shell in the container. The main reason this flag is used is to be able to abort the docker command by using `CTRL+C`.
- the `--rm`: automatically removes the container when it exits.
- the `--ipc=host`: is recommended when using Chrome ([Docker docs](https://docs.docker.com/engine/reference/run/#ipc-settings---ipc)). Chrome can run out of memory without this flag.
- the `--env FILE_CHANGES_DETECTION_SUPPORTED=true`: sets an environment variable that can be used by the [playwright.config.ts](/demos/docker/playwright.config.ts) to know if the app running in docker will have support for file changes detection. For more info see the [File changes aren't triggering an application rebuild when testing with UI mode](#file-changes-arent-triggering-an-application-rebuild-when-testing-with-ui-mode) section.
- the `--workdir=/app`: sets the working directory inside the container. It's set to be the directory where the app code will be mounted.
- the `-v '<path-to-cloned-repo>\demos\docker:/app'`: mounts the contents of the folder `<path-to-cloned-repo>\demos\docker` into the docker container at `/app`.
- the `-v '/app/node_modules'`: is a way to exclude the `node_modules` folder from the mounted folder above. See [How to Mount a Docker Volume While Excluding a Subdirectory](https://www.howtogeek.com/devops/how-to-mount-a-docker-volume-while-excluding-a-subdirectory/).
- the `mcr.microsoft.com/playwright:v1.40.1-jammy`: is the name and tag of the docker image to run. The tag used needs to match the same version of the `@playwright/test` npm package used by the app.
- the `/bin/bash -c 'npm ci && npx playwright test --ui-port=<container-port> --ui-host=0.0.0.0'`: is the command that the docker image will execute. This command will run `npm ci` to install all the required packages and then starts the Playwright UI mode. The UI mode will be served from the container and it'll be acessible at `http://localhost:<random-port>`. The UI mode URL will be displayed as part of the output of the `npm run test:ui` command.

> [!Note]
>
> The docker command to run the Playwright UI mode doesn't pass the CI environment variable to the docker container, it will always be false and so will the variable `_isRunningOnCI` used by the [playwright.config.ts](/demos/docker/playwright.config.ts). This is intentional as the UI mode is never meant to be executed in a CI environment.

### Available options for running tests with UI mode

> [!NOTE]
>
> For a description of the options see the [playwright.ps1 Powershell script details](#playwrightps1-powershell-script-details) section.

The `npm run test:ui` can be customized with the following options:

- `useHostWebServer`: setting `-useHostWebServer` enables this option.
- `installNpmPackagesMode`: one of `auto`, `install` or `mount`. Example: `-installNpmPackagesMode install`.
- `fileChangesDetectionSupportMode`: one of `auto`, `supported` or `unsupported`. Example: `-fileChangesDetectionSupportMode auto`.

You can combine any of the options. Examples:

```
npm run test:ui '--' -fileChangesDetectionSupportMode supported

npm run test:ui '--' -useHostWebServer -installNpmPackagesMode auto
```

> [!NOTE]
>
> On the example `npm` commands above you only need the single quotes around the double dash if you're running the `npm` command from Powershell. For more info see [Powershell and passing command line arguments to npm commands](#powershell-and-passing-command-line-arguments-to-npm-commands)

## playwright.ps1 Powershell script details

The [playwright.ps1](/demos/docker/npm-pwsh-scripts/playwright.ps1) Powershell script has the logic to build the `docker run` command to run the tests/UI mode in docker. This script accepts the following input parameters:

- `ui`: defaults to `$false`. If this switch is set then the tests will run with UI mode.
- `updateSnapshots`: defaults to `$false`. If this switch is set then the `--update-snapshots` option is passed to the `npx playwright test` command. The [--update-snapshots](https://playwright.dev/docs/test-cli) determines whether to update snapshots with actual results instead of comparing them. **This parameter is ignored if the `-ui` switch is set.**
- `useHostWebServer`: defaults to `$false`. If this switch is set it allows the tests running in the container to run against an instance of the app running on your machine instead of in the docker container. To use this option, first start the app with `npm start` and once the app is running run `npm test` and pass this option.
- `grep`: defaults to an empty string. By default it runs all tests but, if set it adds the `--grep <grep>` option to the `npx playwright test` command. The [`--grep`](https://playwright.dev/docs/test-cli) option only runs tests matching the provided regular expression. **This parameter is ignored if the `-ui` switch is set.**
- `installNpmPackagesMode`: defaults to `auto`. Can be one of `auto`, `install` or `mount`. It defines if the NPM packages need to be installed in the container or if they should be mounted from the host. The `auto` option will install the NPM packages if the host OS is Windows, otherwise it will mount them from the host. The `install` option will always install the NPM packages and the `mount` option will always mount the NPM packages. **This parameter is ignored if the `-useHostWebServer` switch is set.** For more information see [When do you need to install node modules on the docker container](#when-do-you-need-to-install-node-modules-on-the-docker-container).
- `fileChangesDetectionSupportMode`: defaults to `auto`. Can be one of `auto`, `supported` or `unsupported`. It defines if the application running on the Docker container will have support for file changes detection or not by setting the `FILE_CHANGES_DETECTION_SUPPORTED` Docker environment variable as part of the Docker run command. The `auto` option sets the `FILE_CHANGES_DETECTION_SUPPORTED` environment variable to `false` if you're running on Windows and using Docker Desktop with WSL2, otherwise it will set it to `true`. The `supported` option sets environment variable to `true`, whilst the `unsupported` option sets it to `false`. See the [File changes aren't triggering an application rebuild when testing with UI mode](#file-changes-arent-triggering-an-application-rebuild-when-testing-with-ui-mode) section to better understand the reason for this parameter.

## Playwright configuration

The majority of the content of the [playwright.config.ts](/demos/docker/playwright.config.ts) file is what you get by default after [adding Playwright to your project](https://playwright.dev/docs/intro#installing-playwright) with `npm init playwright@latest`.

The main changes are:

1. Declared a few variables at the start that are reused throughout the playwright configuration.
2. Updated the `reporter` array. In addition to using the [default html reporter](https://playwright.dev/docs/test-reporters#html-reporter), we've added the [built-in list reporter](https://playwright.dev/docs/test-reporters#list-reporter).
3. Defined a [baseURL](https://playwright.dev/docs/test-webserver#adding-a-baseurl) so that we can use relative URLs when doing page navigations on the tests.
4. Configured the `webServer` block to run the Angular app locally so that the tests can be executed against it. If you're not testing an Angular app that's fine, you just need to adjust the `webServer.command` so that it launches your app and set the `webServer.url` to the url your app will be running at. For more information see the [webServer docs](https://playwright.dev/docs/test-webserver).
5. Defined the `snapshotPathTemplate` option to group snapshots by Operating System. This is a choice for this demo, it's not mandatory. This options is configured so that all snapshots generated on Unix will be stored at `/tests/__screenshots__/linux` and all snapshots generated on Windows will be storted at `/tests/__screenshots__/win32`. One of the reasons this is done is so that we can add the windows directory to the [.gitignore](/demos/docker/.gitignore) to avoid committing windows snapshots in case someone runs the tests outside of Docker for any reason. Remember that the whole point of running in Docker is to generate Unix like snapshots to get consistent behavior between running locally and on CI, so you should never want to commit windows generated snapshots.

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

Depending on how what you use to run Docker containers and your Operating System, you might struggle with getting the app to rebuild on file changes.

When running tests in UI mode you always want the app to rebuild when you change the code so that you can run tests on your latest changes.

However, if for instance, you're running Docker Desktop using WSL2 then you might not get file change support. As an example, for Angular apps, the default watch mode will not work.

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

The last alternative I can provide to this issue is to run the target test app outside of Docker and then use the `-useHostWebServer` option:

> npm run test:ui '--' -useHostWebServer

Since the app is running outside of Docker the file change detection will work as usual and the `-useHostWebServer` will make the tests running on Docker execute against the instance of the app running on the host. For more information on the `-userHostWebServer` see the [Why should I use the `useHostWebServer` input parameter of the Powershell scripts ?](#why-should-i-use-the-usehostwebserver-input-parameter-of-the-powershell-scripts) section.

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

### I want to use more of the Playwright test CLI options

The current Powershell scripts at `/demos/docker/npm-pwsh-scripts` only allow you to pass a few of the available [Playwright test CLI options](https://playwright.dev/docs/test-cli). If you want to use more options you have to extend the scripts.

### How does the `useHostWebServer` input parameter of the Powershell scripts work ?

If you set `useHostWebServer` switch with `npm test '--' -useHostWebServer` or with `npm run test:ui '--' -useHostWebServer` then the docker container won't have to build and run your app and instead will try to connect to the app running on the host machine.

This is due to the `webServer.reuseExistingServer` option of the [playwright.config.ts](/demos/docker/playwright.config.ts). When this is set to `true` then Playwright will check if the app is running on the `webServer.url` address and if it is then it just uses that as the target of the tests.

The trick to make this work though is that the `webServer.url` must be set to an address that is reachable from the docker container. And since what we want to do is to reach the app that is running on the host then what the `playwright.config.ts` does is set the host of the `webServer.url` to `host.docker.internal`. Furthermore, the docker command must contain `--add-host=host.docker.internal:host-gateway`, which the Powershell scripts adds if `useHostWebServer` is set to `true`.

For more info see:

- [I want to connect from a container to a service on the host](https://docs.docker.com/desktop/networking/#i-want-to-connect-from-a-container-to-a-service-on-the-host)
- [How to connect to the Docker host from inside a Docker container?](https://medium.com/@TimvanBaarsen/how-to-connect-to-the-docker-host-from-inside-a-docker-container-112b4c71bc66)

### Why should I use the `useHostWebServer` input parameter of the Powershell scripts ?

If you set the `useHostWebServer` switch with `npm test '--' -useHostWebServer` or with `npm run test:ui '--' -useHostWebServer` then the docker container won't have to build and run your app and instead will try to connect to the app running on the host machine.

This means that you can start the app once with `npm start` and then run the tests against it multiple times with `npm test`. Depending on your app, skipping the building and running of the app as well as the node modules install if needed as well, might result in a non-trivial time saving for your dev loop.

> [!TIP]
>
> For most of the time I suggest using the `npm test:ui` for your dev loop. This command will also only and run the app once and then the UI mode will run the tests against it. When you do changes on the app or the tests everything is hot reloaded and you can keep developing and running the tests as you go.

### Why are my Playwright tests running in Docker slow?

This shouldn't be the case. In my experience, Playwright runs quicker in the `mcr.microsoft.com/playwright` docker image than outside of docker, especially if you're running on Windows.

The issue that you might be facing though is something that I've encountered on a setup where I was mounting the node_modules directory into the container and that was affecting the filesystem performance. I was running on Windows and the workaround I used for this was to change Docker's engine from using WSL2 to using WSL1.

If you're using a Windows machine and you're mounting a large number of files to the docker container then you might want to try using WSL1 as your Docker's engine.

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
npm test '--' -ui -useHostWebServer
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
- `open tests ui`: runs the Playwright tests in a docker container using UI mode.
- `show tests report`: opens the test results report.

**To get access to these tasks make sure you open the `/demos/docker/` folder in Visual Studio Code.**

> [!TIP]
>
> You can run Visual Studio Code tasks through Quick Open (Ctrl+P) by typing 'task', Space and the command name. For more info see [Integrate with External Tools via Tasks](https://code.visualstudio.com/docs/editor/tasks).

### Example running the tests using the Visual Studio Code task

When you run the `run tests` task you will be prompted for some input which is then passed on to the [playwright.ps1](#playwrightps1-powershell-script-details) Powershell script.

https://github.com/edumserrano/playwright-adventures/assets/15857357/204e5a7e-c098-4823-bf0e-36f240620f22

### Example running the tests using the Visual Studio task and setting `useHostWebServer` to `yes`

When you run the `run tests` task and choose `yes` to the `Do you want to use the host's web server?` prompt, notice that the docker container won't have to install packages nor build and run the app. It immediatly starts to run the tests against the version of the app that is running on the host.

You have to run the app locally outside of docker before you choose this option.

https://github.com/edumserrano/playwright-adventures/assets/15857357/f4c6bbad-ce61-4400-a1a8-3a94a32ba107

### Example running the tests in UI mode using the Visual Studio Code task

When you run the `open tests ui` task you will be prompted for some input which is then passed on to the [playwright.ps1](#playwrightps1-powershell-script-details) Powershell script.

https://github.com/edumserrano/playwright-adventures/assets/15857357/923f30a0-27ad-4197-bb12-557c8746e688

### Example debugging the app using Visual Studio Code

Although this is not related with running Playwright in docker, this demo also shows how you can configure a [launch task](/demos/docker/.vscode/launch.json) for Visual Studio Code that let's you debug the app in Visual Studio Code.

https://github.com/edumserrano/playwright-adventures/assets/15857357/db540972-f60c-4a1a-9f08-d61c38af28ec
