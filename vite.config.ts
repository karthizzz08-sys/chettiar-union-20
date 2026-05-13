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
      // Node.js modules are handled by alias or will fail with clear errors
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@tanstack/start-storage-context": path.resolve(
        __dirname,
        "./src/lib/mock-storage-context.ts"
      ),
    },
  },
});
