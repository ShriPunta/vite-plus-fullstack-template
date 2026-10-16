import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { schema } from "@pkg/schema";
import { eq } from "drizzle-orm";

import { db } from "../db.ts";

const UserSchema = z
	.object({
		id: z.uuid().openapi({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" }),
		email: z.email().openapi({ example: "alice@example.com" }),
		name: z.string().openapi({ example: "Alice" }),
		createdAt: z.coerce.date().openapi({ example: "2024-01-01T00:00:00.000Z" }),
	})
	.openapi("User");

const CreateUserSchema = z
	.object({
		email: z.email().openapi({ example: "alice@example.com" }),
		name: z.string().min(1).max(100).openapi({ example: "Alice" }),
	})
	.openapi("CreateUser");

const ErrorSchema = z.object({ error: z.string() }).openapi("Error");

const IdParam = z.object({
	id: z.uuid().openapi({ param: { name: "id", in: "path" } }),
});

const tags = ["users"];

const listRoute = createRoute({
	tags,
	method: "get",
	path: "/",
	summary: "List users",
	responses: {
		200: {
			description: "Array of users",
			content: { "application/json": { schema: z.array(UserSchema) } },
		},
	},
});

const createUserRoute = createRoute({
	tags,
	method: "post",
	path: "/",
	summary: "Create a user",
	request: {
		body: { content: { "application/json": { schema: CreateUserSchema } }, required: true },
	},
	responses: {
		201: {
			description: "Created",
			content: { "application/json": { schema: UserSchema } },
		},
	},
});

const getRoute = createRoute({
	tags,
	method: "get",
	path: "/{id}",
	summary: "Get a user",
	request: { params: IdParam },
	responses: {
		200: { description: "Found", content: { "application/json": { schema: UserSchema } } },
		404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } },
	},
});

export const usersRouter = new OpenAPIHono();

usersRouter.openapi(listRoute, async (c) => {
	const rows = await db.select().from(schema.users);
	return c.json(rows, 200);
});

usersRouter.openapi(createUserRoute, async (c) => {
	const input = c.req.valid("json");
	const [row] = await db.insert(schema.users).values(input).returning();
	return c.json(row, 201);
});

usersRouter.openapi(getRoute, async (c) => {
	const { id } = c.req.valid("param");
	const [row] = await db.select().from(schema.users).where(eq(schema.users.id, id));
	if (!row) return c.json({ error: "Not found" }, 404);
	return c.json(row, 200);
});
