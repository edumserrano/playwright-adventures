# Playwright adventures

- [Description](#description)
- [Playwright demos](#playwright-demos)
  - [Required \& recommended dependencies](#required--recommended-dependencies)
- [Learn more about Playwright](#learn-more-about-playwright)

## Description

This repo aims to consolidate and share some of the experiences I've had and the solutions I've come up with whilst using Playwright to test Angular apps. 

> [!NOTE]
>
> Although the code demos presented here use Angular, the Playwright concepts that are demoed are frontend framework agnostic which means they and can be applied to any frontend framework.

## Playwright demos

- [Playwright code coverage with monocart-reporter](/demos/code-coverage-with-monocart-reporter/README.md)
- [Playwright code coverage Istanbul via Webpack Babel plugin](/demos/code-coverage-with-istanbul-via-webpack-babel-plugin/README.md)
- [Which code coverage should I use with Playwright? monocart-reporter or Istanbul with Webpack Babel plugin?](/docs/v8-vs-istanbul.md)
- [Run Playwright tests in Docker](/demos/docker/README.md): especially helpful if you develop in Windows machines but your CI severs are Linux machines.

### Required & recommended dependencies

If you face issues running any of the demos then check if you're missing one of the dependencies listed below.

- [Node](https://nodejs.org/en/blog/release/v20.10.0). Tested working with `v20.10.0`. If you need to have different versions of node installed it's recommended that you use [Node Version Manager](https://github.com/nvm-sh/nvm) to install and swap between node versions.
- [npm@latest](https://www.npmjs.com/package/npm): package manager used on the demos. Tested working on `10.2.5`.
- [latest Powershell](https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell): some demos make use of powershell scripts. Tested working on `7.4.0`.
- [Git LFS](https://git-lfs.com/). The demos use Playwright to take screenshots and those images are uploaded to the repo using Git LFS. Without Git LFS you won't get any images when cloning the repo. Tested working with `3.3.0`.
- [Docker](https://www.docker.com/products/docker-desktop/): required for the demo that runs Playwright tests via docker.
- [VS Code](https://code.visualstudio.com/download) is recommended as a code editor but you can use whatever you prefer.

## Learn more about Playwright

- [Playwright docs](https://playwright.dev/docs/intro): official documentation.
- [Playwright API reference](https://playwright.dev/docs/api/class-playwright): official API reference.
- [Playwright's YoutTube channel](https://www.youtube.com/@Playwrightdev): small sized videos about what's new with each Playwright release. Great way to keep up to date.
- [Learn Playwright - Resources for learning end-to-end testing using Playwright automation framework](https://ray.run/): great curated collection of Playwright resources. From blogs, to FAQS, to videos, etc.
- [CommitQuality Playwright's YouTube Playlist](https://www.youtube.com/playlist?list=PLXgRgGX8-5UVm9yioRY329rfcfy3MusiY): small sized tutorials that will help you master Playwright.
- [Playwright's Discord channel](https://discord.com/servers/playwright-807756831384403968): great for interacting with community members and asking questions.
- [Playwright's GitHub issues](https://github.com/microsoft/playwright/issues): always worth searching through when you're trying to learn new concepts or in case others have faced some problem you might be facing. 