import { defineConfig } from "tsup";

export default defineConfig([
  {
    clean: true,
    dts: true,
    entry: ["src/index.ts"],
    external: ["@octokit/openapi-types"],
    format: ["esm", "cjs"],
    splitting: false,
    treeshake: true,
  },
  {
    banner: { js: "#!/usr/bin/env node" },
    clean: false,
    entry: ["src/cli.ts"],
    format: ["esm"],
    outExtension: () => ({ js: ".js" }),
  },
]);
