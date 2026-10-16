import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	// Time-ordered UUIDs (Postgres 18+): better index locality than random v4.
	id: uuid("id")
		.primaryKey()
		.default(sql`uuidv7()`),
	email: text("email").notNull().unique(),
	name: text("name").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
