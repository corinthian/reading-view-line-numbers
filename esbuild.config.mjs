import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";

const dev = process.argv[2] === "dev";

const context = await esbuild.context({
  entryPoints: ["main.ts"],
  bundle: true,
  external: [
    "obsidian",
    "electron",
    "@codemirror/autocomplete",
    "@codemirror/collab",
    "@codemirror/commands",
    "@codemirror/language",
    "@codemirror/lint",
    "@codemirror/search",
    "@codemirror/state",
    "@codemirror/view",
    "@lezer/common",
    "@lezer/highlight",
    "@lezer/lr",
    ...builtins,
  ],
  format: "cjs",
  target: "es6",
  logLevel: "info",
  sourcemap: dev ? "inline" : false,
  treeShaking: true,
  outfile: "main.js",
});

if (dev) {
  await context.watch();
} else {
  await context.rebuild();
  process.exit(0);
}
