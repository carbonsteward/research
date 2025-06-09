import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: Number(process.env.VITE_PORT) || 5173,
    host: process.env.VITE_HOST || "localhost",
    fs: {
      strict: false,
      allow: [
        // 프로젝트 루트
        process.cwd(),
        // 상위 디렉토리 (node_modules 접근용)
        path.resolve(process.cwd(), '..'),
        // node_modules
        path.resolve(process.cwd(), 'node_modules'),
      ],
    },
  },
});
