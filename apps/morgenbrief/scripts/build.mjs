import { cp, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = new URL("../", import.meta.url);
await rm(new URL("build/", root), { recursive: true, force: true });
execFileSync(process.execPath, [fileURLToPath(new URL("node_modules/typescript/bin/tsc", root))], {
  cwd: fileURLToPath(root),
  stdio: "inherit"
});
await cp(new URL("public/", root), new URL("build/frontend/", root), { recursive: true });

await build({
  entryPoints: [fileURLToPath(new URL("src/frontend/reader-controller.ts", root))],
  outfile: fileURLToPath(new URL("build/frontend/reader-controller.js", root)),
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  minify: true
});
