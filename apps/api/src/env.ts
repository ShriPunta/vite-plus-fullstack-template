import { z } from "zod";

const EnvSchema = z.object({
	DATABASE_URL: z.url(),
	PORT: z.coerce.number().int().positive().default(3000),
	CORS_ORIGIN: z
		.string()
		.default("http://localhost:5173")
		.transform((s) => s.split(",").map((o) => o.trim().replace(/\/+$/, "")))
		.pipe(z.array(z.url()).min(1)),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
	console.error("Invalid API env:", z.prettifyError(parsed.error));
	process.exit(1);
}

export const env = parsed.data;
