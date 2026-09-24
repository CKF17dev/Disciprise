import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite est un outil qui "sert" notre app React en développement.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
});