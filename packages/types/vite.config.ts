import { defineConfig } from "vite-plus";

export default defineConfig({
	test: {
		name: "@pkg/types",
	},
	run: {
		tasks: {
			test: "vp test",
		},
	},
});
