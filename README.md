# Playwright adventures

- [Description](#description)
- [Required \& recommended dependencies](#required--recommended-dependencies)
- [Playwright demos](#playwright-demos)
- [Tips](#tips)
- [Learn more about Playwright](#learn-more-about-playwright)

## Description

This repo aims to consolidate and share some of the experiences I've had and the solutions I've come up with whilst using Playwright to test Angular apps. 

> [!NOTE]
>
> Although the code demos presented here use Angular, the Playwright concepts that are demoed are frontend framework agnostic which means they and can be applied to any frontend framework.

## Required & recommended dependencies

If you face issues running any of the demos then check if you're missing one of the dependencies listed below.

- [Node](https://nodejs.org/en/blog/release/v20.10.0). Tested working with `v20.10.0`. If you need to have different versions of node installed it's recommended that you use [Node Version Manager](https://github.com/nvm-sh/nvm) to install and swap between node versions.
- [npm@latest](https://www.npmjs.com/package/npm): package manager used on the demos. Tested working on `10.2.5`.
- [Git LFS](https://git-lfs.com/). The demos use Playwright to take screenshots and those images are uploaded to the repo using Git LFS. Without Git LFS you won't get any images when cloning the repo and the Playwright tests will fail. Tested working with `3.3.0`.
- [latest Powershell](https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell): some demos make use of powershell scripts. Tested working on `7.4.0`.
- [Docker](https://www.docker.com/products/docker-desktop/): required for the demo that runs Playwright tests via docker.
- [VS Code](https://code.visualstudio.com/download) is recommended as a code editor but you can use whatever you prefer.

## Playwright demos

| Demo                                                                                                                          | Description                                                                                                                                                                                                                                                                                           |
| :---------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [code-coverage-with-monocart-reporter](/demos/code-coverage-with-monocart-reporter/README.md)                                 | Playwright code coverage using [monocart-reporter](https://github.com/cenfun/monocart-reporter).                                                                                                                                                                                                      |
| [code-coverage-with-istanbul-via-webpack-babel-plugin](/demos/code-coverage-with-istanbul-via-webpack-babel-plugin/README.md) | Playwright code coverage using [Istanbul via Webpack Babel plugin](https://github.com/istanbuljs/babel-plugin-istanbul).                                                                                                                                                                              |
| [docker](/demos/docker/README.md)                                                                                             | Run Playwright tests in Docker. Also shows how to use Playwright tests UI mode in Docker. Especially helpful to eliminate screenshot differences if you develop in Windows machines but your CI severs are Linux machines.                                                                            |
| [stale-screenshots-cleanup](/demos/stale-screenshots-cleanup/README.md)                                                       | Delete stale Playwright test screenshots.                                                                                                                                                                                                                                                             |
| [fixtures](/demos/fixtures/README.md)                                                                                         | Shows useful Playwright fixtures you can reuse. For instance: <br/><br/> - time/date emulation so that you can do reliable asserts on screenshots or text that contains time/date information; <br/>- fail tests upon unexpected console messages or time/date emulation for reproducible.<br/>- etc. |

## Tips

- [Which code coverage should I use with Playwright? monocart-reporter or Istanbul with Webpack Babel plugin?](/docs/v8-vs-istanbul.md)

## Learn more about Playwright

- [Playwright docs](https://playwright.dev/docs/intro): official documentation.
- [Playwright API reference](https://playwright.dev/docs/api/class-playwright): official API reference.
- [Playwright's YoutTube channel](https://www.youtube.com/@Playwrightdev): small sized videos about what's new with each Playwright release. Great way to keep up to date.
- [Learn Playwright - Resources for learning end-to-end testing using Playwright automation framework](https://ray.run/): great curated collection of Playwright resources. From blogs, to FAQS, to videos, etc.
- [CommitQuality Playwright's YouTube Playlist](https://www.youtube.com/playlist?list=PLXgRgGX8-5UVm9yioRY329rfcfy3MusiY): small sized tutorials that will help you master Playwright.
- [Playwright's Discord channel](https://discord.com/servers/playwright-807756831384403968): great for interacting with community members and asking questions.
- [Playwright's GitHub issues](https://github.com/microsoft/playwright/issues): always worth searching through when you're trying to learn new concepts or in case others have faced some problem you might be facing. 
