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
        admin: resolve(__dirname, '4dm1n/index.html'),
        l0g1n: resolve(__dirname, 'l0g1n/index.html'),
        login: resolve(__dirname, 'login/index.html'),
        order: resolve(__dirname, 'draft-order/index.html'),
        view: resolve(__dirname, 'draft-view/index.html'),
        contacts: resolve(__dirname, 'contacts/index.html'),
        blog: resolve(__dirname, 'blog/index.html'),
        blogAlomyr: resolve(__dirname, 'blog/alomyr/index.html')
        // notFound: resolve(__dirname, '404.html') // Desabilitado para deploy: não subir a página 404 por hora
      }
    }
  }
});
