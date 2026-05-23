import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// Builds the React carpet configurator into a single IIFE bundle
// Output goes to extensions/carpet-configurator/assets/
// This is separate from the main Remix app build.
export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "production"
    ),
  },
  build: {
    outDir: "extensions/carpet-configurator/assets",
    emptyOutDir: false,
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, "src/main.tsx"),
      name: "TessandaCarpetConfigurator",
      formats: ["iife"],
      fileName: () => "carpet-configurator.js",
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") {
            return "carpet-configurator.css";
          }
          return assetInfo.name ?? "asset";
        },
      },
    },
  },
});
