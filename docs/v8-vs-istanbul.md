# Which code coverage should I use with Playwright? monocart-reporter or Istanbul with Webpack Babel plugin?

[This table](https://github.com/cenfun/monocart-coverage-reports?tab=readme-ov-file#compare-reports) summarizes the differences when collecting code coverage with `Istanbul` or with `v8` as well as when using the `monocart-reporter` to convert from `v8` to `Istanbul` reports.

Perhaps the main differences between using `Istanbul` or `v8` for code coverage are:

- `v8` only works on `chromium`. That's why there's a function named `browserSupportsV8CodeCoverage` at [v8-code-coverage.ts](/demos/code-coverage-with-monocart-reporter/tests/_shared/fixtures/v8-code-coverage.ts) to only collect `v8` code coverage if the test is running on `chromium`. 
- `v8` can track code coverage on HTML and CSS files whilst `Istanbul` only tracks code coverage on JavaScript files.

When you're using Playwright, the fact that `v8` code coverage only works on `chromium` shouldn't be much of a problem since it's very likely that you'll be running your tests against a `chromium` browser. This only becomes a slight issue if you have some  tests to specifically check non `chromium` browsers behaviour. If that's the case then you wouldn't be getting code coverage for those when using `v8`.

Conversely, the fact `v8` provides `html` and `CSS` coverage is usually not that important. It's useful yes, but I would argue that having `JS` code coverage and Visual Regression tests with Playwright are more than enough.

**So where does that leave us? I'd say use whatever you find easier. For me, using code coverage with `monocart-reporter` fits that. I already use `monocart-reporter` as the Playwright test results reporter so having it provide code coverage as well just makes things simple.**

Lastly, I would call out that this is not an either/or choice, if you need to, you can mix both approaches and have the code instrumented with both `v8` and `Istanbul` at the same time.