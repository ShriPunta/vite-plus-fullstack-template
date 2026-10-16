import { defineConfig } from "vite-plus";

const generated = [
	"**/dist/**",
	"**/routeTree.gen.ts",
	"packages/schema/drizzle/**",
	"infra/data/**",
];

export default defineConfig({
	// `vp test` at the root runs every package's tests, each with its own vite.config.ts.
	test: {
		projects: ["apps/*", "packages/*"],
	},

	// Pre-commit (.vite-hooks/pre-commit → `vp staged`).
	staged: {
		"*": "vp check --fix",
	},

	// Oxfmt (replaces Biome formatter). Mirrors the previous Biome style.
	fmt: {
		useTabs: true,
		tabWidth: 2,
		printWidth: 100,
		singleQuote: false,
		trailingComma: "all",
		sortImports: true,
		sortPackageJson: true,
		sortTailwindcss: {
			stylesheet: "./apps/web/src/index.css",
			functions: ["cn", "cva"],
		},
		ignorePatterns: [...generated, "pnpm-lock.yaml"],
	},

	// Oxlint (replaces Biome linter). Type-aware + type-check runs TypeScript 7 (tsgo) via tsgolint.
	lint: {
		plugins: ["typescript", "unicorn", "oxc", "import"],
		categories: {
			correctness: "error",
			suspicious: "warn",
			perf: "warn",
		},
		jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
		rules: {
			"vite-plus/prefer-vite-plus-imports": "error",
			"import/no-cycle": "error",
			"typescript/no-floating-promises": "error",
			"typescript/consistent-type-imports": "error",
			"import/no-unassigned-import": ["warn", { allow: ["**/*.css"] }],
		},
		ignorePatterns: generated,
		options: { typeAware: true, typeCheck: true },
		overrides: [
			{
				// React app: Rules of Hooks + React Compiler-powered rules (native in Oxlint, no ESLint needed).
				// The compiler's rules (purity, immutability, refs, set-state-in-effect, …) are in the
				// `correctness` category. No react-perf: the compiler auto-memoizes.
				files: ["apps/web/**"],
				plugins: ["react", "jsx-a11y"],
				env: { browser: true },
				rules: {
					"react/rules-of-hooks": "error",
					"react/exhaustive-deps": "error",
					"react/only-export-components": ["warn", { allowExportNames: ["Route"] }],
					"react/react-in-jsx-scope": "off",
				},
			},
			{
				// TanStack file routes export `Route`; shadcn/ui exports variants beside components.
				files: ["apps/web/src/routes/**", "apps/web/src/components/ui/**"],
				plugins: ["react"],
				rules: { "react/only-export-components": "off" },
			},
			{
				files: ["apps/api/**", "packages/**"],
				env: { node: true },
			},
			{
				files: ["**/*.test.ts", "**/*.test.tsx"],
				plugins: ["vitest"],
			},
		],
	},

	run: {
		cache: { scripts: false, tasks: true },
	},
});
