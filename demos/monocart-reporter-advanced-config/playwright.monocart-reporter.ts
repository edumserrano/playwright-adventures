import { MonocartReporterOptions } from "monocart-reporter";
import path from "path";

export function getMonocartReporterOptions(
  testResultsDir: string,
): MonocartReporterOptions {
  const monocartOptions: MonocartReporterOptions = {
    name: "playwright monocart-reporter demo",
    outputFile: path.resolve(testResultsDir, "monocart-report.html"),
    tags: {
      // See https://github.com/cenfun/monocart-reporter#style-tags
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
    customFieldsInComments: true,
    columns: (defaultColumns: any) => {
      // See https://github.com/cenfun/monocart-reporter#custom-columns
      //
      // Need to define a custom column that will be used to map the data collected from the
      // `customFieldsInComments: true` option defined above.
      // Because the test comments at demos/monocart-reporter-advanced-config/tests/example.spec.ts
      // only contain the @description comment item, I only need to define a single column with id
      // 'description'.
      //
      // If the tests used multiple comment items, such as @description and @owner, then I would have
      // to also define a custom column with id of 'owner' to map its values to the report.

      const descriptionColumn = defaultColumns.find(
        (column: any) => column.id === "description",
      );

      // if there's no description column then add one and place it before the duration column
      if (!descriptionColumn) {
        const index = defaultColumns.findIndex(
          (column: any) => column.id === "duration",
        );
        defaultColumns.splice(index, 0, {
          id: "description",
          name: "Description",
          align: "left",
          searchable: true,
          detailed: true,
          markdown: true,
          styleMap: {
            "font-weight": "normal",
          },
        });
      }
    },
  };
  return monocartOptions;
}
