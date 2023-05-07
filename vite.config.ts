import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";
import { BASE_URL } from "./src/global-config";

export default defineConfig({
  plugins: [sveltekit()],
  ssr: {
    noExternal:
      process.env.NODE_ENV === "production" ? ["@carbon/charts", "carbon-components"] : [],
  },
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
  },
  server: {
    proxy: {
      [BASE_URL]: {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
