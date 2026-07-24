import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Inside Docker Compose, the frontend and backend run in *separate
// containers*. "localhost" inside the frontend container refers to the
// frontend container itself, not the backend - so proxying to
// "http://localhost:5000" always fails there with ECONNREFUSED, even
// though the backend is perfectly reachable at "http://backend:5000"
// (its service name on the shared Docker network). We read the target
// from an env var so it can be overridden per-environment:
//   - docker-compose.yml sets PROXY_TARGET=http://backend:5000
//   - running the frontend directly on your machine (no Docker) falls
//     back to http://localhost:5000, which is correct in that case.
const PROXY_TARGET = process.env.PROXY_TARGET || "http://localhost:5000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: PROXY_TARGET,
        changeOrigin: true,
      },
      "/uploads": {
        target: PROXY_TARGET,
        changeOrigin: true,
      },
      "/results": {
        target: PROXY_TARGET,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
