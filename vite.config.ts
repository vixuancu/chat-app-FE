import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- gọi plugin tailwind
  ],
  optimizeDeps: {
    // Force pre-bundle these dependencies
    include: [
      "react",
      "react-dom",
      "react-router-dom",
    ],
    // Exclude from pre-bundling (usually for ESM-only packages)
    exclude: [
      // Add any problematic dependencies here
    ],
    // Force optimize on startup
    force: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/pages": path.resolve(__dirname, "./src/pages"),
      "@/services": path.resolve(__dirname, "./src/services"),
      "@/data": path.resolve(__dirname, "./src/data"),
      "@/utils": path.resolve(__dirname, "./src/utils"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/routes": path.resolve(__dirname, "./src/routes"),
      "@/assets": path.resolve(__dirname, "./src/assets"),
    },
  },
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    proxy: {
      // Proxy API calls đến backend
      "/api": {
        target: "http://localhost:8080", // Backend server URL
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, ""), // Bỏ comment nếu backend không có prefix /api
      },
      // Proxy WebSocket cho chat real-time  
      "/ws": {
        target: "ws://localhost:8080",
        ws: true,
        changeOrigin: true,
      },
      // Proxy cho file uploads
      "/uploads": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // Output directory
    outDir: "dist",
    // Generate source maps for production debugging
    sourcemap: true,
    // Minify options
    minify: "esbuild", // faster than terser
    // Target browsers
    target: "esnext",
    // Rollup options
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // Vendor chunk for stable dependencies
          vendor: ["react", "react-dom"],
          // Router chunk
          router: ["react-router-dom"],
        },
        // Asset file naming
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return `assets/[name]-[hash][extname]`;
          
          if (/\.(css)$/.test(assetInfo.name)) {
            return `css/[name]-[hash][extname]`;
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `images/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        // JS chunk file naming
        chunkFileNames: "js/[name]-[hash].js",
        entryFileNames: "js/[name]-[hash].js",
      },
    },
    // Chunk size warning limit (500kb)
    chunkSizeWarningLimit: 500,
    // CSS code splitting
    cssCodeSplit: true,
  },
});
