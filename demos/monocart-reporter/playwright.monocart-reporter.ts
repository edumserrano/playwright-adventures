import { MonocartReporterOptions } from "monocart-reporter";
import path from "path";

export function getMonocartReporterOptions(testResultsDir: string): MonocartReporterOptions {
  const monocartOptions: MonocartReporterOptions = {
    name: "playwright monocart-reporter demo",
    outputFile: path.resolve(testResultsDir, "monocart-report.html"),
    /* See https://github.com/cenfun/monocart-reporter#style-tags */
    tags: {
      "press-me-button": {
        background: "#0066cc",
      },
      critical: {
        background: " #cc66ff",
      },
      "with-ctrl-modifier": {
        background: "#6600cc",
      },
      accessibility: {
        background: "#009933",
      },
    },
    /* See https://github.com/cenfun/monocart-reporter#collect-data-from-the-comments */
    visitor: (data: any, metadata: any, collect: any) => {
      const parserOptions = {
        sourceType: "module",
        plugins: ["typescript"],
      };
      const comments = collect.comments(parserOptions);
      if (comments && Object.keys(comments).length > 0) {
        Object.assign(data, comments);
        console.log(comments);
        console.log(data);
      }
    },
  };
  return monocartOptions;
}
