import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, path.resolve(__dirname, ".."), "");
  const frontendPort = Number(rootEnv.FRONTEND_PORT || 3000);

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src")
      }
    },
    server: {
      host: "127.0.0.1",
      port: frontendPort,
      strictPort: true
    },
    preview: {
      host: "127.0.0.1",
      port: frontendPort,
      strictPort: true
    }
  };
});
