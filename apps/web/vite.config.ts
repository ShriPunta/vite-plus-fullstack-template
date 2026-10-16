import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

export default defineConfig({
	plugins: [
		tanstackRouter({ target: "react", autoCodeSplitting: true }),
		// React Compiler via Oxc (Rust) — no Babel. Requires `oxc-transform-react`.
		react({ compiler: true }),
		tailwindcss(),
	],
	resolve: {
		alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
	},
	// Single .env at the repo root (shared with the API and Docker Compose).
	envDir: "../..",
	server: {
		port: 5173,
	},
	test: {
		name: "@app/web",
	},
	run: {
		tasks: {
			build: "vp build",
			test: "vp test",
		},
	},
});
