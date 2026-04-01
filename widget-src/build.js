import esbuild from "esbuild";

esbuild.build({
  entryPoints: ["widget-src/index.js"],
  bundle: true,
  minify: true,
  outfile: "extensions/countdown-widget/assets/countdown-widget.js",
  format: "iife",
  target: ["es2018"],
  jsxFactory: "h",
  jsxFragment: "Fragment",
  define: {
    "process.env.NODE_ENV": '"production"',
  },
}).then(() => {
  console.log("Widget built successfully");
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
