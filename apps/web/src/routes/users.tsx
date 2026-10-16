import { UserSchema } from "@pkg/types";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { env } from "@/env";

const UsersResponse = z.array(UserSchema);

async function fetchUsers() {
	const res = await fetch(`${env.VITE_API_URL}/api/users`);
	if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
	return UsersResponse.parse(await res.json());
}

export const Route = createFileRoute("/users")({
	loader: fetchUsers,
	component: UsersPage,
	errorComponent: ({ error }) => (
		<p className="text-red-600">
			{error instanceof Error ? error.message : "Failed to load users"}
		</p>
	),
});

function UsersPage() {
	const users = Route.useLoaderData();
	const router = useRouter();

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<h2 className="text-xl font-bold">Users</h2>
				<Button size="sm" variant="outline" onClick={() => void router.invalidate()}>
					Refresh
				</Button>
			</div>
			<ul className="space-y-1">
				{users.map((u) => (
					<li key={u.id} className="rounded border px-3 py-2">
						<span className="font-medium">{u.name}</span>{" "}
						<span className="text-neutral-500">{u.email}</span>
					</li>
				))}
			</ul>
		</div>
	);
}
