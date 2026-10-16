import { z } from "zod";

const EnvSchema = z.object({
	DATABASE_URL: z.url(),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
	console.error("Invalid schema env:", z.prettifyError(parsed.error));
	process.exit(1);
}

export const env = parsed.data;
