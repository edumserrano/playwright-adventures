# Run Playwright tests via docker

- [Description](#description)
- [How to build, run the app, run tests and view the test results](#how-to-build-run-the-app-run-tests-and-view-the-test-results)
- [The app](#the-app)
- [Run tests](#run-tests)
  - [What to expect](#what-to-expect)
  - [The docker command to run Playwright tests](#the-docker-command-to-run-playwright-tests)
  - [playwright.ps1 Powershell script details](#playwrightps1-powershell-script-details)
- [Run tests with UI mode](#run-tests-with-ui-mode)
  - [What to expect](#what-to-expect-1)
  - [The docker command to run Playwright tests with UI mode](#the-docker-command-to-run-playwright-tests-with-ui-mode)
  - [playwright-ui.ps1 Powershell script details](#playwright-uips1-powershell-script-details)
- [Playwright configuration](#playwright-configuration)
- [Other notes on the docker integration](#other-notes-on-the-docker-integration)
  - [You don't always need to install node modules on the docker container](#you-dont-always-need-to-install-node-modules-on-the-docker-container)
  - [I want to use more of the Playwright test CLI options](#i-want-to-use-more-of-the-playwright-test-cli-options)
  - [How does the `useHostWebServer` input parameter of the Powershell scripts work ?](#how-does-the-usehostwebserver-input-parameter-of-the-powershell-scripts-work-)
  - [Why should I use the `useHostWebServer` input parameter of the Powershell scripts ?](#why-should-i-use-the-usehostwebserver-input-parameter-of-the-powershell-scripts-)
  - [Running Playwright in docker is slow](#running-playwright-in-docker-is-slow)
  - [Playwright's test execution stops midway when running on Docker](#playwrights-test-execution-stops-midway-when-running-on-docker)
  - [Do I need Powershell to run Playwright in Docker?](#do-i-need-powershell-to-run-playwright-in-docker)
  - [Powershell and passing command line arguments to npm commands](#powershell-and-passing-command-line-arguments-to-npm-commands)
  - [Simplify the logic on the Powershell scripts if you don't need it](#simplify-the-logic-on-the-powershell-scripts-if-you-dont-need-it)
- [Bonus: Visual Studio Code integration](#bonus-visual-studio-code-integration)
  - [Example running the tests using the Visual Studio Code task](#example-running-the-tests-using-the-visual-studio-code-task)
  - [Example running the tests using the Visual Studio task and setting `useHostWebServer` to `yes`](#example-running-the-tests-using-the-visual-studio-task-and-setting-usehostwebserver-to-yes)
  - [Example running the tests in UI mode using the Visual Studio Code task](#example-running-the-tests-in-ui-mode-using-the-visual-studio-code-task)
  - [Example debugging the app using Visual Studio Code](#example-debugging-the-app-using-visual-studio-code)

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

## How to build, run the app, run tests and view the test results

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
6) After running the tests with `npm test` you can view test results with:
    ```
    npm run test:show-report
    ```
7) Run the tests in UI mode with:
    ```
    npm run test:ui
    ```
    This will start a docker container which will run the app and then start [Playwright's UI mode](https://playwright.dev/docs/test-ui-mode). The UI mode will be served from the container and it'll be acessible at `http://localhost:<random-port>`. The UI mode URL will be displayed as part of the output of the `npm run test:ui` command.
8) If you just want to run the app execute the command:
    ```
    npm start
    ```
    Once the command finishes the app should open in your default browser at [http://127.0.0.1:4200/](http://127.0.0.1:4200/).

## The app

The app being tested is an Angular 17 app. It has no changes from the template you get from doing `ng new`.

> [!NOTE]
>
> Although the app being tested is an Angular app, the Playwright concepts that are demoed are frontend framework agnostic which means they and can be applied to any frontend framework.
>

## Run tests

### What to expect

When you run `npm test` this is what you should expect:

![npm test output](/docs/assets/npm-test.gif)

### The docker command to run Playwright tests

The docker setup to run the Playwright tests is based on the [Playwright Docker docs](https://playwright.dev/docs/docker). When running `npm test`, the [playwright.ps1](/demos/docker/npm-pwsh-scripts/playwright.ps1) Powershell script is executed and builds the following docker command run the Playwright tests:
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

### playwright.ps1 Powershell script details

The [playwright.ps1](/demos/docker/npm-pwsh-scripts/playwright.ps1) Powershell script accepts the following input parameters:

- `updateSnapshots`: defaults to `$false`. If this switch is set then the `--update-snapshots` option is passed to the `npx playwright test` command. The [--update-snapshots](https://playwright.dev/docs/test-cli) determines whether to update snapshots with actual results instead of comparing them. If you're using Powershell you can set this option by doing: `npm test '--' -updateSnapshots`.
- `useHostWebServer`: defaults to `$false`. If this switch is set it allows the tests running in the container to run against an instance of the app running on your machine instead of in the docker container. To use this option, first start the app with `npm start` and once the app is running run `npm test` and pass this option. If you're using Powershell you can do it like so: `npm test '--' -useHostWebServer`
- `grep`: defaults to an empty string. By default it runs all tests but, if set it adds the `--grep <grep>` option to the `npx playwright test` command. The [`--grep`](https://playwright.dev/docs/test-cli) option only runs tests matching the provided regular expression. If you're using Powershell you can pass this option to `npm test` by doing `npm test '--' -grep "<regex>"`.

You can combine any of the above options. For instance, if you're using Powershell, you can pass multiple options like so:
```
npm test '--' -updateSnapshots -useHostWebServer -grep "screenshot"
```

## Run tests with UI mode

### What to expect

When you run `npm run test:ui` this is what you should expect:

![npm run test:ui output](/docs/assets/npm-test-ui.gif)

### The docker command to run Playwright tests with UI mode

The docker setup to run the tests with the Playwright UI mode is based on the [Playwright Docker docs](https://playwright.dev/docs/docker) and the [Playwright Docker & GitHub Codespaces docs](https://playwright.dev/docs/test-ui-mode#docker--github-codespaces). When running `npm run test:ui`, the [playwright-ui.ps1](/demos/docker/npm-pwsh-scripts/playwright-ui.ps1) Powershell script is executed and builds the following docker command run the Playwright UI mode:
```
docker run -it --rm --ipc=host --workdir=/app -p <host-port>:<container-port> -v '<path-to-cloned-repo>\demos\docker:/app' -v '/app/node_modules' mcr.microsoft.com/playwright:v1.40.1-jammy /bin/bash -c 'npm ci && npx playwright test --ui-port=<container-port> --ui-host=0.0.0.0'
```

Let's analyse the docker command:

- the `-it`: instructs Docker to allocate a pseudo-TTY connected to the container's stdin; creating an interactive bash shell in the container. The main reason this flag is used is to be able to abort the docker command by using `CTRL+C`.
- the `--rm`: automatically removes the container when it exits.
- the `--ipc=host`: is recommended when using Chrome ([Docker docs](https://docs.docker.com/engine/reference/run/#ipc-settings---ipc)). Chrome can run out of memory without this flag.
- the `--workdir=/app`: sets the working directory inside the container. It's set to be the directory where the app code will be mounted.
- the `-v '<path-to-cloned-repo>\demos\docker:/app'`: mounts the contents of the folder `<path-to-cloned-repo>\demos\docker` into the docker container at `/app`.
- the `-v '/app/node_modules'`: is a way to exclude the `node_modules` folder from the mounted folder above. See [How to Mount a Docker Volume While Excluding a Subdirectory](https://www.howtogeek.com/devops/how-to-mount-a-docker-volume-while-excluding-a-subdirectory/).
- the `mcr.microsoft.com/playwright:v1.40.1-jammy`: is the name and tag of the docker image to run. The tag used needs to match the same version of the `@playwright/test` npm package used by the app.
- the `/bin/bash -c 'npm ci && npx playwright test --ui-port=<container-port> --ui-host=0.0.0.0'`: is the command that the docker image will execute. This command will run `npm ci` to install all the required packages and then starts the Playwright UI mode. The UI mode will be served from the container and it'll be acessible at `http://localhost:<random-port>`. The UI mode URL will be displayed as part of the output of the `npm run test:ui` command.

> [!Note]
>
> The docker command to run the Playwright UI mode doesn't pass the CI environment variable to the docker container, it will always be false and so will the variable `_isRunningOnCI` used by the [playwright.config.ts](/demos/docker/playwright.config.ts). This is intentional as the UI mode is never meant to be executed in a CI environment. 
>

### playwright-ui.ps1 Powershell script details

The [playwright-ui.ps1](/demos/docker/npm-pwsh-scripts/playwright-ui.ps1) Powershell script accepts the following input parameters:

- `useHostWebServer`: defaults to `$false`. If this switch is set it allows the tests running in the container to run against an instance of the app running on your machine instead of in the docker container. To use this option, first start the app with `npm start` and once the app is running run `npm test` and pass this option. If you're using Powershell you can do it like so: `npm run test:ui '--' -useHostWebServer`

When the docker command to start the Playwright UI completes it will display the following message:
```
Listening on http://0.0.0.0:<port>
```

Once you see this message you can access the Playwright UI by going to `http://localhost:<port>`.

## Playwright configuration

The majority of the content of the [playwright.config.ts](/demos/docker/playwright.config.ts) file is what you get by default after [adding Playwright to your project](https://playwright.dev/docs/intro#installing-playwright) with `npm init playwright@latest`.

The main changes are:

1) Declared a few variables at the start that are reused throught the playwright configuration.
2) Updated the `reporter` array. In addition to using the [default html reporter](https://playwright.dev/docs/test-reporters#html-reporter), we've added the [built-in list reporter](https://playwright.dev/docs/test-reporters#list-reporter). To keep this demo focused on its goal, this Playwright configuration isn't using the [monocart-reporter](https://github.com/cenfun/monocart-reporter) but I strongly advise you to try it out. For an usage example see the `playwright.config.ts` for the [Playwright code coverage with monocart-reporter demo](/demos/code-coverage-with-monocart-reporter/README.md).
3) Configured the `webServer` block to run the Angular app locally so that the tests can be executed against it. If you're not testing an Angular app that's fine, you just need to adjust the `webServer.command` so that it launches your app and set the `webServer.url` to the url your app will be running at. For more information see the [webServer docs](https://playwright.dev/docs/test-webserver).
4) Defined the `snapshotPathTemplate` option to group snapshots by Operating System. This is a choice for this demo, it's not mandatory. This options is configured so that all snapshots generated on Unix will be stored at `/tests/__screenshots__/linux` and all snapshots generated on Windows will be storted at `/tests/__screenshots__/win32`. One of the reasons this is done is so that we can add the windows directory to the [.gitignore](/demos/docker/.gitignore) to avoid committing windows snapshots in case someone runs the tests outside of Docker for any reason. Remember that the whole point of running in Docker is to generate Unix like snapshots to get consistent behavior between running locally and on CI, so you should never want to commit windows generated snapshots. 

> [!NOTE]
> 
> The `_isRunningOnCI` variable used on the `playwright.config.ts` changes the value of some options when running tests on CI. To set the `_isRunningOnCI` variable to `true` you must set the environment variable `CI` to `true` before running the tests. For more information regarding using Playwright on a CI environment see [Playwright docs on Continuous Integration](https://playwright.dev/docs/ci). 
>

Furthermore, we have created:
- a [playwright.cli-options.ts](/demos/docker/playwright.cli-options.ts) file: to represent Playwright CLI options we care about.
- a [playwright.env-vars.ts](/demos/docker/playwright.env-vars.ts) file: to represent environment variables we care about.

> [!NOTE]
>
> You don't have to create the `playwright.cli-options.ts` or the `playwright.env-vars.ts` file. You can have all of this on the `playwright.config.ts`. Code structure is up to you.
>

> [!NOTE]
> 
> Depending on your `playwright.config.ts`, make sure you update your `.gitignore` to exclude any directory used by test results, report results, etc. Scroll to the end of this demo's [.gitignore](/demos/docker/.gitignore) to see an example.
> 

## Other notes on the docker integration

### You don't always need to install node modules on the docker container

The [playwright.ps1](/demos/docker/npm-pwsh-scripts/playwright.ps1) and [playwright-ui.ps1](/demos/docker/npm-pwsh-scripts/playwright-ui.ps1) Powershell scripts have logic to determine whether the npm packages need to be installed or not. 

This logic was added because the demo Angular app depends on the [esbuild npm package](https://www.npmjs.com/package/esbuild) which installs Operating System specific binaries. This means that, for instance, if you're running the demo app on Windows and then you mount the node modules into the container then you get an error like this when you try to start the app:

> [WebServer] An unhandled exception occurred: 
You installed esbuild for another platform than the one you're currently using.
This won't work because esbuild is written with native code and needs to       
install a platform-specific binary executable.
>
> Specifically the "@esbuild/win32-x64" package is present but this platform     
needs the "@esbuild/linux-x64" package instead. People often get into this     
situation by installing esbuild on Windows or macOS and copying "node_modules" 
into a Docker image that runs Linux, or by copying "node_modules" between      
Windows and WSL environments.
>
> If you are installing with npm, you can try not copying the "node_modules"     
directory when you copy the files over, and running "npm ci" or "npm install"  
on the destination platform after the copy. Or you could consider using yarn   
instead of npm which has built-in support for installing a package on multiple 
platforms simultaneously.
>
> If you are installing with yarn, you can try listing both this platform and the
other platform in your ".yarnrc.yml" file using the "supportedArchitectures"   
feature: https://yarnpkg.com/configuration/yarnrc/#supportedArchitectures      
Keep in mind that this means multiple copies of esbuild will be present.
>
> Another alternative is to use the "esbuild-wasm" package instead, which works
the same way on all platforms. But it comes with a heavy performance cost and
can sometimes be 10x slower than the "esbuild" package, so you may also not
want to do that.

As the error message advises, the solution employed by the Powershell scripts was to **NOT** copy the `node_modules` folder into the docker container if the host Operating System is Windows or if you've set the `useHostWebServer` switch (which means the demo app will **NOT** have to be built and run inside the docker container).

> [!WARNING]
>
> This code demo doesn't have to deal with private NPM registries, but if you are using private registries then you will have to extend this demo to pass the NPM authentication to the docker container. This is only needed if you need to install the node modules on the container as explained above.
>
> For more info see:
> 
> - [Using private packages in a CI/CD workflow](https://docs.npmjs.com/using-private-packages-in-a-ci-cd-workflow)
> - [Using auth tokens in .npmrc](https://stackoverflow.com/questions/53099434/using-auth-tokens-in-npmrc)
>

### I want to use more of the Playwright test CLI options

The current Powershell scripts at `/demos/docker/npm-pwsh-scripts` only allow you to pass a few of the available [Playwright test CLI options](https://playwright.dev/docs/test-cli). If you want to use more options you have to extend the scripts.

### How does the `useHostWebServer` input parameter of the Powershell scripts work ?

If you set `useHostWebServer` switch with `npm test '--' -useHostWebServer` or with `npm run test:ui '--' -useHostWebServer` then the docker container won't have to build and run your app and instead will try to connect to the app running on the host machine. 

This is due to the `webServer.reuseExistingServer` option of the [playwright.config.ts](/demos/docker/playwright.config.ts). When this is set to `true` then Playwright will check if the app is running on the `webServer.url` address and if it is then it just uses that as the target of the tests.

The trick to make this work though is that the `webServer.url` must be set to an address that is reachable from the docker container. And since what we want to do is to reach the app that is running on the host then what the `playwright.config.ts` does is set the host of the `webServer.url` to `host.docker.internal`. Furthermore, the docker command must contain `--add-host=host.docker.internal:host-gateway`, which the Powershell scripts add if `useHostWebServer` is set to `yes`.

For more info see:

- [I want to connect from a container to a service on the host](https://docs.docker.com/desktop/networking/#i-want-to-connect-from-a-container-to-a-service-on-the-host)
- [How to connect to the Docker host from inside a Docker container?](https://medium.com/@TimvanBaarsen/how-to-connect-to-the-docker-host-from-inside-a-docker-container-112b4c71bc66)


### Why should I use the `useHostWebServer` input parameter of the Powershell scripts ?

If you set the `useHostWebServer` switch with `npm test '--' -useHostWebServer` or with `npm run test:ui '--' -useHostWebServer` then the docker container won't have to build and run your app and instead will try to connect to the app running on the host machine.

This means that you can start the app once with `npm start` and then run the tests against it multiple times with `npm test`. Depending on your app, skipping the building and running of the app as well as the node modules install if needed as well, might result in a non-trivial time saving for your dev loop.

> [!TIP]
>
> For most of the time I suggest using the `npm test:ui` for your dev loop. This command will also only and run the app once and then the UI mode will run the tests against it. When you do changes on the app or the tests everything is hot reloaded and you can keep developing and running the tests as you go.
>  

### Running Playwright in docker is slow

This shouldn't be the case. In my experience, Playwright runs quicker in the `mcr.microsoft.com/playwright` docker image than outside of docker, especially if you're running on Windows.

The issue that you might be facing though is something that I've encountered on a setup where I was copying mounting the node_modules directory into the container and that was affecting the filesystem performance. I was running on Windows and the workaround I used for this was to change Docker's engine from using WSL2 to using WSL1. 

If you're using a Windows machine and you're mounting a large number of files to the docker container then you might want to try using WSL1 as your Docker's engine.

For more information see [microsoft/WSL [wsl2] filesystem performance is much slower than wsl1 in /mnt #4197](https://github.com/microsoft/WSL/issues/4197), more specifically [this comment](https://github.com/microsoft/WSL/issues/4197#issuecomment-604592340).

> [!TIP]
>
> If you're using [Docker for Desktop](https://www.docker.com/products/docker-desktop/) switching the Docker engine can easily be done in the `General settings`. You can always toggle back to WSL2 at any time.

### Playwright's test execution stops midway when running on Docker

If the tests' execution fails midway when running on Docker, it might be due to low memory available to the Docker container. Try increasing the memory limits set for Docker.

> [!TIP]
>
> You should consider increasing the CPU and memory resources given to Docker to improve the Playwright's test execution speed. Especially the CPU resources because Playwright will try to [parallelize the test execution according to the number of available CPUs](https://playwright.dev/docs/test-parallel).
>

### Do I need Powershell to run Playwright in Docker?

No, this demo used Powershell to create a script with the logic to build the docker commands but you don't need it. Hopefully this demo explained the required building blocks and you can use them as you wish to create your docker commands.

### Powershell and passing command line arguments to npm commands

You can use the `--` notation to [pass command line arguments to npm commands](https://dev.to/felipperegazio/handling-command-line-arguments-in-npm-scripts-2ean). However, if you're using Powershell and want to pass command line arguments then you should either use a double `-- --` notation or single quotes like `'--'`. 

Fore more info see [PowerShell, NPM Scripts, and Silently Dropped Arguments](https://www.lloydatkinson.net/posts/2022/powershell-npm-scripts-and-silently-dropped-arguments/).

### Simplify the logic on the Powershell scripts if you don't need it

The Powershell scripts at `/demos/docker/npm-pwsh-scripts` accept some input parameters and by default deal with the possibility of having to install the node modules inside the container if you're running the demo on Windows.

I'd suggest simplifying the Powershell scripts if you don't need the input parameters or if your app does not need to [install node modules inside the container](#you-dont-always-need-to-install-node-modules-on-the-docker-container), for instance, because you're developing on a mac or because you're not using any package that is OS specific.

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
>

### Example running the tests using the Visual Studio Code task

When you run the `run tests` task you will be prompted for some input which is then passed on to the [playwright.ps1](#playwrightps1-powershell-script-details) Powershell script.

![VSCode test task example](/docs/assets/vscode-test.gif)

### Example running the tests using the Visual Studio task and setting `useHostWebServer` to `yes`

When you run the `run tests` task and choose `yes` to the `Do you want to use the host's web server?` prompt, notice that the docker container won't have to install packages nor build and run the app. It immediatly starts to run the tests against the version of the app that is running on the host.

You have to run the app locally outside of docker before you choose this option.

![VSCode test with localhost serve task example](/docs/assets/vscode-test-with-localhost-serve.gif)

### Example running the tests in UI mode using the Visual Studio Code task

When you run the `open tests ui` task you will be prompted for some input which is then passed on to the [playwright-ui.ps1](#playwright-uips1-powershell-script-details) Powershell script.

![VSCode test with UI mode](/docs/assets/vscode-test-ui.gif)

### Example debugging the app using Visual Studio Code

Although this is not related with running Playwright in docker, this demo also shows how you can configure a [launch task](/demos/docker/.vscode/launch.json) for Visual Studio Code that let's you debug the app in Visual Studio Code.

![VSCode debug](/docs/assets/vscode-debug.gif)
