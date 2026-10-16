import { z } from "zod";

export const UserSchema = z.object({
	id: z.uuid(),
	email: z.email(),
	name: z.string().min(1),
	createdAt: z.coerce.date(),
});
export type User = z.infer<typeof UserSchema>;

export const CreateUserInput = z.object({
	email: z.email(),
	name: z.string().min(1).max(100),
});
export type CreateUserInput = z.infer<typeof CreateUserInput>;
