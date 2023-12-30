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
    columns: (defaultColumns: any) => {
      // See https://github.com/cenfun/monocart-reporter#custom-columns
      //
      // Need to define a custom column that will be used to map the data collected from the visitor
      // function defined below.
      // Because the visitor function is collectng test comments and the test comments only contain
      // the @description comment item, I only need to define a single column with id 'description'.
      //
      // If the tests used multiple comment items, such as @description and @owner, then I would have
      // to also define a custom column with id of 'owner' to map its values to the report.

      const descriptionColumn = defaultColumns.find(
        (column: any) => column.id === "description",
      );
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
    visitor: (data: any, metadata: any, collect: any) => {
      // See https://github.com/cenfun/monocart-reporter#collect-data-from-the-comments
      //
      // This implementation of the visitor function will analyze all test comments and
      // collect comment items that start with '@'.
      //
      // The tests on this demo app only have a single comment item: '@description'. Therefore,
      // this function will collect the comments from '@description' and save them in the data
      // object, with the key 'description'.
      // This means that the 'data.description' can be accessed in other parts of the report,
      // such as by custom columns. Custom columns can pick up their values from the data
      // object. For instance, defining a custom column with id of 'description' will pick up
      // the values of the test comments that use the @description comment item.
      //
      // You can define multiple comment items in a single comment. For instance, you could
      // define @description and @owner and have those two values added to the data object.

      const parserOptions = {
        sourceType: "module",
        plugins: ["typescript"],
      };
      const comments = collect.comments(parserOptions);
      if (comments && Object.keys(comments).length > 0) {
        Object.assign(data, comments);
      }
    },
  };
  return monocartOptions;
}
