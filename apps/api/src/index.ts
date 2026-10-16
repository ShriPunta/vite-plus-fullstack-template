import { serve } from "@hono/node-server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { sql } from "drizzle-orm";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { db } from "./db.ts";
import { env } from "./env.ts";
import { usersRouter } from "./routes/users.ts";

const app = new OpenAPIHono();

app.use("*", logger());
app.use(
	"*",
	cors({
		origin: env.CORS_ORIGIN.length === 1 ? env.CORS_ORIGIN[0] : env.CORS_ORIGIN,
	}),
);

app.get("/api/health", (c) => c.json({ ok: true }));
app.route("/api/users", usersRouter);

app.doc("/openapi.json", {
	openapi: "3.1.0",
	info: { title: "API", version: "0.1.0" },
	servers: [{ url: `http://localhost:${env.PORT}`, description: "Local dev" }],
});

app.get("/docs", Scalar({ url: "/openapi.json", theme: "default" }));

try {
	await db.execute(sql`select 1`);
} catch (err) {
	console.error("DB connection failed:", err);
	process.exit(1);
}

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
	console.log(`API listening on :${info.port}`);
	console.log(`Docs: http://localhost:${info.port}/docs`);
});
