import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        contacts: resolve(__dirname, 'contacts/index.html')
      }
    }
  }
});
