import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      tailwindcss(), // <-- gọi plugin tailwind
    ],
    optimizeDeps: {
      // Force pre-bundle these dependencies
      include: ["react", "react-dom", "react-router-dom"],
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
        "@client": path.resolve(__dirname, "./src/client"),
        "@admin": path.resolve(__dirname, "./src/admin"),
        "@shared": path.resolve(__dirname, "./src/shared"),
        "@/assets": path.resolve(__dirname, "./src/assets"),
      },
    },
    server: {
      port: parseInt(env.VITE_PORT || "3000"),
      host: env.VITE_HOST || true,
      strictPort: true,
      proxy: {
        // Proxy API calls đến backend (port 8081)
        "/api": {
          target: env.VITE_BACKEND_API_URL || "http://localhost:8081",
          changeOrigin: true,
          secure: false,
          // rewrite: (path) => path.replace(/^\/api/, ""), // Bỏ comment nếu backend không có prefix /api
        },
        // Proxy WebSocket cho chat real-time
        "/ws": {
          target: env.VITE_BACKEND_WS_URL || "ws://localhost:8081",
          ws: true,
          changeOrigin: true,
        },
        // Proxy cho file uploads
        "/uploads": {
          target: env.VITE_BACKEND_API_URL || "http://localhost:8081",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      // Output directory
      outDir: "dist",
      // Remove console.log in production, keep errors
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ["console.log", "console.info", "console.debug"],
        },
      },
      // Disable source maps for production (enable if needed for debugging)
      sourcemap: false,
      // Target modern browsers
      target: "es2015",
      // Rollup options
      rollupOptions: {
        output: {
          // Manual chunks for better caching
          manualChunks: {
            // Vendor chunk for stable dependencies
            "react-vendor": ["react", "react-dom"],
            "router-vendor": ["react-router-dom"],
            "form-vendor": ["react-hook-form"],
            "utils-vendor": ["axios"],
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
  };
});
