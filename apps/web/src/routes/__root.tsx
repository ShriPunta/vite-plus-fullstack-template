import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
	component: () => (
		<div className="min-h-dvh">
			<nav className="flex gap-4 border-b p-4">
				<Link to="/" className="font-semibold">
					Home
				</Link>
				<Link to="/users">Users</Link>
			</nav>
			<main className="p-6">
				<Outlet />
			</main>
		</div>
	),
});
