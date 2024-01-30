import { defineConfig } from "vite";

export default defineConfig({
    plugins: [splitVendorChunkPlugin()],
    base: "./",
    esbuild: { legalComments: "none" },
});
