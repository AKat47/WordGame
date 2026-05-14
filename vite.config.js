import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  cacheDir: "/tmp/vite-word-garden",
  server: {
    proxy: {
      // Forward /api/* from Vite dev server → Express on port 3001
      "/api": {
        target:       "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
