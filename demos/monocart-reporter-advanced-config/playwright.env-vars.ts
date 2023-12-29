import z from "zod";

// Validating environment variables with zod
// - https://jfranciscosousa.com/blog/validating-environment-variables-with-zod/
const _envSchema = z.object({
  CI: z
    .enum(["0", "1", "true", "false", "True", "False"])
    .catch("false")
    .transform(value => value === "true" || value === "1" || value === "True"),
});
export const env = _envSchema.parse(process.env);
