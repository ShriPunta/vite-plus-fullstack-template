import { defineConfig } from "vite-plus";

export default defineConfig({
	// `vp pack` (tsdown) bundles the API + workspace packages into dist/index.mjs.
	// The API's own npm dependencies stay external; `postgres` is bundled because it is only a
	// (transitive) dependency of @pkg/schema and would not resolve from apps/api at runtime.
	pack: {
		entry: "src/index.ts",
		platform: "node",
		dts: false,
		deps: {
			alwaysBundle: [/^@pkg\//],
			onlyBundle: [/^@pkg\//, "postgres"],
		},
	},
	run: {
		tasks: {
			build: "vp pack",
		},
	},
});
