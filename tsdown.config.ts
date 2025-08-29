import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/index.ts"],
  platform: "node",
  dts: {
    oxc: true,
    compilerOptions: {
      removeComments: true,
    },
  },
  format: ["esm", "cjs"],
  clean: ["dist", "coverage"],
  sourcemap: true,
  minify: false,
  external: ["bun:test"],
});
