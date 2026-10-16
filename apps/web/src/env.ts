import { z } from "zod";

const EnvSchema = z.object({
	VITE_API_URL: z.string(),
});

const parsed = EnvSchema.safeParse(import.meta.env);
if (!parsed.success) {
	throw new Error(`Invalid web env:\n${z.prettifyError(parsed.error)}`);
}

export const env = parsed.data;
