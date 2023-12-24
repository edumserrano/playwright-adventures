# Useful Playwright Fixtures

- [Description](#description)
- [Time/Date emulation](#timedate-emulation)
- [Capture Console Messages](#capture-console-messages)
- [Fail tests upon unexpected console messages](#fail-tests-upon-unexpected-console-messages)
- [Capture page errors](#capture-page-errors)
- [Fail tests on page errors](#fail-tests-on-page-errors)
- [Project name](#project-name)
- [Custom annotations](#custom-annotations)

## Description

A proper description of what a Playwright fixture is can be found on the [official docs](https://playwright.dev/docs/test-fixtures#introduction). For the purpose of this code demo, you can think of fixtures as a way to provide, or even [automatically apply](https://playwright.dev/docs/test-fixtures#automatic-fixtures), behaviour to your tests.

The fixtures used in this code demo are all declared on the [app-fixtures.ts](/demos/fixtures/tests/_shared/app-fixtures.ts) file.

## Time/Date emulation

Playwright let's you [emulate a real device such as a mobile phone or tablet](https://playwright.dev/docs/emulation). This means you can control things like a [Locale & Timezone](https://playwright.dev/docs/emulation#locale--timezone), however if you need to control the value of the Time/Date then there's nothing built-in to Playwright to help you do that.

Setting the value of Time/Date is very useful when you need to take a screenshot or assert on values that contain Time/Date information. It's also important if your app has time based actions such as "press a button and after X amount of time some action occurs". To be able to implement reliable tests on these scenarios you need to be able to control Time/Date.

The `setDate` fixture is an [automatic fixture](https://playwright.dev/docs/test-fixtures#automatic-fixtures) that shows how you can use the [Page.addInitScript](https://playwright.dev/docs/api/class-page#page-add-init-script) function to control the values returned by  [JavaScript's Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) constructor and the `Date.now` function. See [set-date.ts](/demos/fixtures/tests/_shared/fixtures/set-date.ts) file.   

The [setDate test at example.spec.ts](/demos/fixtures/tests/example.spec.ts) shows this fixture at work by allowing reliable asserts on a text field that is based on the current Date and on the screenshot.

> [!NOTE]
>
> This fixture is based on [this comment](https://github.com/microsoft/playwright/issues/6347#issuecomment-1085850728) from the [microsoft/playwright [Feature] Time/Date emulation via e.g. a clock() primitive #6347](https://github.com/microsoft/playwright/issues/6347) GitHub issue.
>
> The issue contains other solutions such as the one from [this comment](https://github.com/microsoft/playwright/issues/6347#issuecomment-965887758) which uses [Sinon.JS fake timers](https://sinonjs.org/releases/latest/fake-timers/). The `Sinon.JS fake timers` solution not only allows you to set the current Date but it also allows you to control the flow of time. This type of solution is useful if you need to do a test where you need to perform an action and then wait X amount of time before doing something else. Using the `Sinon.JS fake timers` would let you code tests for that behaviour in a reliable way.
> 

> [!TIP]
> 
> You can also consider using the `mask` option of the [toHaveScreenshot](https://playwright.dev/docs/api/class-pageassertions#page-assertions-to-have-screenshot-2) to take a screenshot and ignore the part that has dynamic data such as a Time/Date.
>

## Capture Console Messages

The `consoleMessages` fixture shows how you can use the [Page.on('console')](https://playwright.dev/docs/api/class-page#page-event-console) event to capture all Console Messages. See [console-messages.ts](/demos/fixtures/tests/_shared/fixtures/console-messages.ts).

The [console-messages.ts](/demos/fixtures/tests/_shared/fixtures/console-messages.ts) has a filter function named `isExcluded` so that you can filter out Console Messages you don't care about. For instance when running an Angular 17 app with Vite (which this demo is), the Vite dev server will produce some Console Messages we want to ignore.

The [consoleMessages and failOnUnexpectedConsoleMessages test at example.spec.ts](/demos/fixtures/tests/example.spec.ts) shows how you can use the fixture to assert that the app is producing an expected console message.

## Fail tests upon unexpected console messages

The `failOnUnexpectedConsoleMessages` fixture adds an assert to all the tests to check for unexpected Console Messages. If your app produces some Console Messages then you should exclude them using the `isAllowed` function available on the fixture. See [fail-on-unexpected-console-messages.ts](/demos/fixtures/tests/_shared/fixtures/fail-on-unexpected-console-messages.ts).

This fixture is great to catch left over debug/temp Console Messages. 

The [failOnUnexpectedConsoleMessages test at example.spec.ts](/demos/fixtures/tests/example.spec.ts) shows how this fixture fails a test if an unexpect console message is produced.

> ![NOTE]
> 
> This fixture makes use of the [composable property of fixtures](https://playwright.dev/docs/test-fixtures#with-fixtures) and builds upon the [consoleMessages fixture](#capture-console-messages). 
>

## Capture page errors

The `uncaughtExceptions` fixture shows how you can use the [Page.on('pageerror')](https://playwright.dev/docs/api/class-page#page-event-page-error) event to capture all uncaught exceptions that happen within the page. See [page-errors.ts](/demos/fixtures/tests/_shared/fixtures/page-errors.ts).

The [uncaughtExceptions test at example.spec.ts](/demos/fixtures/tests/example.spec.ts) shows how this fixture fails a test if an unexpect exception occurs.

## Fail tests on page errors

The `failOnUncaughtExceptions` fixture adds an assert to all tests to make sure they don't produce any uncaught exceptions. See 
[fail-on-page-errors.ts](/demos/fixtures/tests/_shared/fixtures/fail-on-page-errors.ts).

The [failOnUncaughtExceptions test at example.spec.ts](/demos/fixtures/tests/example.spec.ts) shows this fixture making a test fail because it produces an uncaught exception.

> ![NOTE]
> 
> This fixture makes use of the [composable property of fixtures](https://playwright.dev/docs/test-fixtures#with-fixtures) and builds upon the [uncaughtExceptions fixture](#capture-page-errors). 
>

## Project name

The `projectName` fixture allows you to control behaviour of your tests based on the [Playwright project](https://playwright.dev/docs/test-projects) name. For instance, you might want to skip a test or provide different values to a test depending on the project name.

The [projectName test at example.spec.ts](/demos/fixtures/tests/example.spec.ts) shows an example usage of this fixture.

This fixture is useful because it uses the [PlaywrightProjectName]() type to define a discriminated union for all the valid names for a Project. With this type you have a type safe way to filter on Project names. 

## Custom annotations

Playwright supports [custom annotations](https://playwright.dev/docs/test-annotations#custom-annotations). Annotations are key/value pairs accessible via [test.info().annotations](https://playwright.dev/docs/api/class-testinfo#test-info-annotations). Many reporters support annotations.

The `annotations` fixture shows how you can add custom annotations to your tests, which are visible on the `html` test report:

![custom-annotations](/docs/assets/custom-annotations.png)

See [annotations.ts](/demos/fixtures/tests/_shared/fixtures/annotations.ts). All tests will have these custom annotations. 
