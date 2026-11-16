import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { handleAi } from "./api/ai";

// Saat development, endpoint /api/ai dilayani di sini agar API key Gemini
// tetap berada di sisi server (tidak masuk ke bundle browser).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      react(),
      {
        name: "local-ai-api",
        configureServer(server) {
          server.middlewares.use("/api/ai", (req, res) => {
            if (req.method !== "POST") {
              res.statusCode = 405;
              res.end();
              return;
            }
            let raw = "";
            req.on("data", (chunk: Buffer) => {
              raw += chunk;
            });
            req.on("end", async () => {
              let body: unknown = null;
              try {
                body = JSON.parse(raw);
              } catch {
                body = null;
              }
              const out = await handleAi(body, env.GEMINI_API_KEY, env.GEMINI_MODEL);
              res.statusCode = out.status;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(out.json));
            });
          });
        },
      },
    ],
  };
});
