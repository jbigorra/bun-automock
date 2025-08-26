import { build } from "bun";

const result = await build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  target: "bun",
  sourcemap: "external",
  minify: false,
  throw: false,
});

if (!result.success) {
  console.error("Build failed with errors:", result.logs);
  process.exit(1);
}
