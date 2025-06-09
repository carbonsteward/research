import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
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
        // 홈 디렉토리의 프로젝트들
        '/Users/sam/Custom App',
        // node_modules
        path.resolve(process.cwd(), 'node_modules'),
      ],
      deny: [],
    },
  },
});
