import z from "zod";

// Validating environment variables with zod
// - https://jfranciscosousa.com/blog/validating-environment-variables-with-zod/
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
});
export const env = _envSchema.parse(process.env);
