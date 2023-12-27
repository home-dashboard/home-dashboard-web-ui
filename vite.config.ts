import solid from "solid-start/vite";
import { defineConfig } from "vite";
import { BASE_FILE_URL, BASE_URL } from "./src/global-config";

export default defineConfig({
  plugins: [solid({ ssr: false })],
  server: {
    proxy: {
      [BASE_URL]: {
        target: "http://localhost:8080",
        changeOrigin: true
      },
      [BASE_FILE_URL]: {
        target: "http://localhost:8080",
        changeOrigin: true
      }
    }
  }
});
