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
      "critical": {
          background: " #cc66ff",
      },
      "with-ctrl-modifier": {
          background: "#6600cc",
      },
      accessibility: {
          background: "#009933",
      },
  },
  };
  return monocartOptions;
}
