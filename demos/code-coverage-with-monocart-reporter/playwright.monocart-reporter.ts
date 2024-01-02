import {
  CoverageReportOptions,
  MonocartReporterOptions,
  ReportDescription,
} from "monocart-reporter";
import path from "path";

function getCodeCoverageOptions(
  codeCoverageDir: string,
): CoverageReportOptions {
  const v8RelativeFilePath = "v8/index.html";

  // The paths in the codeCoverageReports variable are all relative to monocart-reporter coverage.outputDir.
  //
  // Note that you can configure the reports to produce just an lcov or cobertura report for instance.
  // No need to produce html report like the html-spa or v8 reports if the only thing you want is an lcov
  // report to upload to sonarQ.
  // However, I do recommend always having an html report so a human can look at it. Even if you only generate
  // it outside your CI environment, just for local dev purposes.
  const _codeCoverageReports: ReportDescription[] = [
    [
      "v8",
      {
        outputFile: v8RelativeFilePath, // v8 sub dir and html file name, relative to coverage.outputDir.
        inline: true, // inline all scripts required for the V8 html report into a single HTML file.
        metrics: ["functions", "branches", "lines"],
      },
    ],
    [
      "console-summary",
      {
        metrics: ["functions", "branches", "lines"],
      },
    ],
    [
      "cobertura",
      {
        file: "cobertura/code-coverage.cobertura.xml",
      },
    ],
    [
      "lcovonly",
      {
        file: "lcov/code-coverage.lcov.info",
      },
    ],
    [
      "html-spa",
      {
        subdir: "html-spa",
      },
    ],
  ];

  // for documentation on the monocart code coverage options see:
  // - https://github.com/cenfun/monocart-reporter#code-coverage-report
  // - https://github.com/cenfun/monocart-coverage-reports
  // - https://github.com/cenfun/monocart-coverage-reports/blob/main/lib/index.d.ts
  const coverageOptions: CoverageReportOptions = {
    outputDir: codeCoverageDir, // all code coverage reports will be created in this dir.
    reportPath: path.resolve(codeCoverageDir, v8RelativeFilePath), // code coverage html report filepath which shows up in the monocart report under global attachments.
    reports: _codeCoverageReports,
    entryFilter: (entry: any) => {
      // Exclude files that aren't excluded by sourceFilter because they
      // are not included in the sourcemap.See:
      // - https://github.com/cenfun/monocart-reporter/issues/60
      //
      // Configure this filter accordingly to your app, you might not
      // even need it if sourceFilter is enough.
      const url = entry.url as string;
      return (
        !url.includes("@vite") &&
        !url.includes("@fs") &&
        !url.includes("fonts.googleapis.com") &&
        url !== "http://127.0.0.1:4200/styles.css"
      );
    },
    sourceFilter: (sourcePath: string) => {
      // Only include files that are under the src folder.
      // Configure this filter accordingly to your app.
      return sourcePath.search(/src\//u) !== -1;
    },
  };
  return coverageOptions;
}

export function getMonocartReporterOptions(
  testResultsDir: string,
  codeCoverageDir: string,
): MonocartReporterOptions {
  const monocartOptions: MonocartReporterOptions = {
    name: "playwright code coverage demo with monocart reporter",
    outputFile: path.resolve(testResultsDir, "monocart-report.html"),
    coverage: getCodeCoverageOptions(codeCoverageDir),
  };
  return monocartOptions;
}
