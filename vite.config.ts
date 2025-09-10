import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- gọi plugin tailwind
  ],
  server: {
    port: 3000,
    host: true,
    strictPort: true,
  },
});
