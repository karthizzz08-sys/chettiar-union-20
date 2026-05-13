import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import path from "path";

// Standard Vite SPA configuration for Netlify static deployment
export default defineConfig({
  plugins: [
    react(),
    tsConfigPaths(),
  ],
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  build: {
    outDir: "dist/client",
    emptyOutDir: true,
    target: "esnext",
    minify: "esbuild",
    rollupOptions: {
      // Mark Node.js modules as external to prevent bundling for browser
      external: ["crypto", "node:crypto", "@tanstack/start-storage-context"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
