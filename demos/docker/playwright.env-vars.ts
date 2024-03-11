import path from "path";
import z from "zod";

// Validating environment variables with zod
// - https://jfranciscosousa.com/blog/validating-environment-variables-with-zod/

// For normal test runs screenshots are added in this directory.
// When running the npm command 'test:clean-screenshots' the screenshots are created in a temp
// directory by providing a value to the environment variable SNAPSHOT_DIR.
const _defaultSnapshotDir = path.resolve("./tests/__screenshots__");

const _envSchema = z.object({
  CI: z
    .enum(["0", "1", "true", "false", "True", "False"])
    .catch("false")
    .transform(value => value === "true" || value === "1" || value === "True"),
  USE_DOCKER_HOST_WEBSERVER: z
    .enum(["0", "1", "true", "false", "True", "False"])
    .catch("false")
    .transform(value => value === "true" || value === "1" || value === "True"),
  FILE_CHANGES_DETECTION_SUPPORTED: z
    .enum(["0", "1", "true", "false", "True", "False"])
    .catch("false")
    .transform(value => value === "true" || value === "1" || value === "True"),
  // The transform below makes it so that we can set to use the default snapshot dir if
  // the SNAPSHOT_DIR environment variable is set to a blank string, not just when it's undefined.
  //
  // - SNAPSHOT_DIR will be undefined when running tests in UI mode or if the Playwright tests are executed outside of the current Docker setup.
  // - SNAPSHOT_DIR will be a blank string when executing tests normally. Meaning when doing 'npm test'.
  // - SNAPSHOT_DIR will have a value for a temp directory when running the 'test:clean-screenshots' NPM command. This command
  // needs to recreate all the screenshots in a different directory from the default to them do a diff with the default dir and find
  // stale screenshots that should be deleted.
  SNAPSHOT_DIR: z
    .string()
    .default(_defaultSnapshotDir)
    .transform(x => (x === "" ? _defaultSnapshotDir : x)),
});
export const playwrightEnv = _envSchema.parse(process.env);
