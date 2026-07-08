import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    outDir: "site",
  },
  test: {
    environment: "jsdom",
  },
});
