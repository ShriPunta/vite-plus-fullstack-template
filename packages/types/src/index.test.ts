import { describe, expect, test } from "vite-plus/test";

import { CreateUserInput, UserSchema } from "./index.ts";

describe("UserSchema", () => {
	test("parses a valid user and coerces createdAt", () => {
		const user = UserSchema.parse({
			id: "a1b2c3d4-e5f6-4890-abcd-ef1234567890",
			email: "ada@example.com",
			name: "Ada",
			createdAt: "2024-01-01T00:00:00.000Z",
		});
		expect(user.createdAt).toBeInstanceOf(Date);
	});

	test("accepts Postgres uuidv7() ids", () => {
		expect(
			UserSchema.safeParse({
				id: "01a142d4-f4f8-7f43-94db-2b4a1196e375",
				email: "linus@example.com",
				name: "Linus",
				createdAt: new Date(),
			}).success,
		).toBe(true);
	});

	test("rejects an invalid email", () => {
		expect(
			UserSchema.safeParse({
				id: "a1b2c3d4-e5f6-4890-abcd-ef1234567890",
				email: "nope",
				name: "Ada",
				createdAt: new Date(),
			}).success,
		).toBe(false);
	});
});

describe("CreateUserInput", () => {
	test("rejects empty and over-long names", () => {
		expect(CreateUserInput.safeParse({ email: "a@b.co", name: "" }).success).toBe(false);
		expect(CreateUserInput.safeParse({ email: "a@b.co", name: "x".repeat(101) }).success).toBe(
			false,
		);
	});
});
