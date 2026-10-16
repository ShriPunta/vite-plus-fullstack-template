# vite-plus-fullstack-template

A fullstack TypeScript monorepo starter on [Vite+](https://viteplus.dev): **Hono** API + **React 19** (TanStack Router, React Compiler) web + **Drizzle** on **Postgres 18**.

One CLI, `vp`, does dev, build, test, lint, format, type checking, task running and git hooks. It replaces Turborepo, Biome, ESLint, `tsc`, husky, lint-staged and Bun from its predecessor, [bun-turbo-fullstack-template](https://github.com/ShriPunta/bun-turbo-fullstack-template).

## Stack

| Concern           | Tool                                                                  | Replaces            |
| ----------------- | --------------------------------------------------------------------- | ------------------- |
| Toolchain CLI     | [Vite+](https://viteplus.dev) `vp` 1.2                                | —                   |
| Task runner/cache | Vite Task (`vp run`)                                                  | Turborepo           |
| Lint              | Oxlint (`vp lint`), incl. native React Compiler rules                 | Biome lint / ESLint |
| Format            | Oxfmt (`vp fmt`), incl. import + Tailwind class sorting               | Biome format        |
| Type check        | TypeScript 7 (Go-native) via tsgolint in `vp check`                   | `tsc --noEmit`      |
| Test              | Vitest 5 (`vp test`)                                                  | —                   |
| Web build         | Vite 8 / Rolldown (`vp build`)                                        | —                   |
| API build         | tsdown (`vp pack`)                                                    | `bun build`         |
| Git hooks         | `.vite-hooks` + `vp staged`                                           | husky + lint-staged |
| Runtime / PM      | Node 24+ (native TypeScript), pnpm 12, managed by Vite+               | Bun                 |
| UI                | React 19 + React Compiler (Oxc/Rust, no Babel), Tailwind 4, shadcn/ui | —                   |
| API               | Hono, `@hono/zod-openapi`, Scalar docs                                | —                   |
| Database          | Postgres 18, Drizzle ORM, `uuidv7()` primary keys                     | Postgres 16         |

## Layout

```
apps/api         Hono API (Node), OpenAPI + Scalar docs at /docs
apps/web         React 19, TanStack Router (file routes, loaders), Tailwind 4, shadcn/ui
packages/schema  Drizzle schema, client, migrations, seed
packages/types   Shared Zod schemas/types (API ↔ web)
infra/           docker-compose (Postgres 18, bind-mounted at infra/data/)
vite.config.ts   Root lint / fmt / staged / test / task config
.claude/         Agent hook enforcing the Vite+ toolchain
```

## Prerequisites

- Node 24.11+ (or let Vite+ manage it)
- Docker (for Postgres)
- Optional but recommended: the global Vite+ CLI. Without it, prefix commands with `pnpm exec`, e.g. `pnpm exec vp check`.

  ```bash
  curl -fsSL https://vite.plus | bash     # macOS / Linux
  irm https://vite.plus/ps1 | iex         # Windows (PowerShell)
  ```

## Getting started

```bash
cp .env.example .env
vp install          # pnpm under the hood (pinned via devEngines)
vp run docker:up    # Postgres 18
vp run db:migrate
vp run db:seed
vp run dev          # API :3000 + web :5173
```

- Web: http://localhost:5173
- API docs: http://localhost:3000/docs

## Commands

| Command                            | What                                                    |
| ---------------------------------- | ------------------------------------------------------- |
| `vp check` / `vp check --fix`      | Format + lint + type check the whole workspace          |
| `vp test`                          | All tests (Vitest projects across packages)             |
| `vp run -r build`                  | Build every package, in dependency order, cached        |
| `vp run dev`                       | API + web dev servers in parallel                       |
| `vp -C apps/web dev`               | Web dev server only                                     |
| `vp run ready`                     | check + test + build                                    |
| `vp run db:generate`               | Generate a Drizzle migration from `schema.ts`           |
| `vp run db:migrate` / `db:seed`    | Apply migrations / seed data                            |
| `vp run docker:up` / `docker:down` | Start / stop Postgres                                   |
| `vp add <pkg>` / `vp remove <pkg>` | Manage dependencies (versions live in the pnpm catalog) |

`vp <name>` runs a **built-in** (`vp dev`, `vp test`, `vp build`…); `vp run <name>` runs a **package script or `vite.config.ts` task**.

## How it fits together

### Tasks and caching (Turborepo replacement)

- `build` and `test` are tasks in each package's `vite.config.ts`, so they are cached.
- Vite Task tracks the files each task reads and writes, so no `inputs`/`outputs` lists are needed.
- `-r` runs packages in workspace dependency order.
- `dev`, `start` and `db:*` are plain `package.json` scripts and are never cached.
- Lint and type checks don't need per-package tasks: `vp check` covers the whole repo in about 1s.

### React Compiler

`@vitejs/plugin-react` with `compiler: true` runs the Oxc (Rust) port of the React Compiler; it needs no Babel. Components are auto-memoized, so manual `useMemo`/`useCallback`/`memo` are unnecessary.

Oxlint's `react` plugin ships the compiler-powered rules natively: `purity`, `refs`, `immutability`, `set-state-in-effect`, `static-components` and more. They're enabled through the `correctness` category for `apps/web/**`.

> The Oxc compiler integration is marked experimental upstream. The stable fallback is `@rolldown/plugin-babel` + `babel-plugin-react-compiler`.

### TypeScript 7

`vp check` type-checks through tsgolint on the Go-native TypeScript 7 toolchain (`lint.options.typeCheck`). Shared compiler options live in `tsconfig.base.json`.

### API on Node

- The API runs TypeScript directly with Node's built-in type stripping, so relative imports use `.ts` extensions.
- Dev uses `node --watch --env-file`.
- `vp pack` bundles the API and its workspace packages into `apps/api/dist/index.mjs`.

### Environment

A single `.env` at the repo root is read by the API, by `packages/schema`, by the web app (`envDir: "../.."`) and by Docker Compose. Node's `--env-file` does **not** expand `${VARS}`, so `DATABASE_URL` is spelled out in full.

### Database

- Postgres 18 runs via `infra/docker-compose.yml`, with data in `infra/data/` (git-ignored).
- IDs default to `uuidv7()`, which is time-ordered and needs Postgres 18+.
- Postgres 16 data directories are not compatible with 18. Migrate them with `pg_dump`/restore or `pg_upgrade`.

### Git hooks

- `vp install` runs `vp config` (the `prepare` script), which installs the `.vite-hooks` dispatcher.
- **pre-commit:** `vp staged`, which runs `vp check --fix` on staged files.
- **pre-push:** type check + tests.

### AI agents

- `CLAUDE.md` documents the toolchain rules.
- `.claude/hooks/enforce-toolchain.sh` is a Claude Code `PreToolUse` hook. It denies `npm`/`npx`/`yarn`/`bun`, `pnpm run`/`pnpm <script>`, and the tools Vite+ replaces (`turbo`, `biome`, `eslint`, `prettier`, `tsc`, `vitest`, bare `vite`…). The denial message points agents to the right `vp` command.

## License

MIT
