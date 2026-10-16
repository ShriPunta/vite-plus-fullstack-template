#!/usr/bin/env bash
# PreToolUse(Bash) hook: keep agents on the Vite+ toolchain.
#   Deps:     vp install|add|remove  (or pnpm install|add|remove|…)
#   Commands: vp check|test|build|dev|run …  (or `pnpm exec vp …` without a global vp)
# Denies npm/npx/yarn/bun, `pnpm run`/`pnpm <script>`, and tools that vp replaces.

cmd=$(jq -r '.tool_input.command // ""')

deny() {
	jq -n --arg r "$1" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
	exit 0
}

HINT="Use vp (or \`pnpm exec vp\` if vp is not on PATH): vp install / vp add <pkg> / vp remove <pkg> for deps; vp check [--fix], vp test, vp run <task>, vp run -r build, vp dev for everything else."

# Drop quoted strings (commit messages, grep patterns) so separators/words inside them don't
# false-positive, then split on shell separators (&&, ||, ;, |, &, newlines) and inspect each
# command's first words.
while IFS= read -r seg; do
	# Trim, drop leading env assignments (FOO=bar) and `command`/`exec`/`time` prefixes.
	seg=$(sed -E 's/^[[:space:]]+//; s/^(([A-Za-z_][A-Za-z0-9_]*=[^[:space:]]*)[[:space:]]+)+//; s/^(command|exec|time)[[:space:]]+//' <<<"$seg")
	read -r w1 w2 w3 _ <<<"$seg"
	w1=${w1##*/} # node_modules/.bin/tsc → tsc
	case "$w1" in
	npm | npx | yarn | bun | bunx)
		deny "Wrong package manager/runner: '$w1' is not used in this repo (pnpm via Vite+). $HINT" ;;
	turbo | biome | eslint | prettier | tsc | tsgo | vitest | oxlint | oxfmt | tsdown | lint-staged | husky)
		deny "'$w1' is replaced by Vite+ (Vite Task, Oxlint, Oxfmt, TS 7 via vp check, Vitest via vp test, tsdown via vp pack, vp staged). $HINT" ;;
	vite)
		deny "Run Vite through Vite+: vp dev / vp build / vp preview. $HINT" ;;
	pnpm)
		case "$w2" in
		install | i | add | remove | rm | uninstall | update | up | upgrade | dedupe | why | outdated | list | ls | ll | la | approve-builds | approve | store | config | dlx | patch | patch-commit | audit | licenses | -v | --version | help | "") ;;
		exec)
			[[ "$w3" == "vp" || "$w3" == "vpr" ]] || deny "Only \`pnpm exec vp …\` is allowed; run other binaries through a package task (vp run …) or \`vp exec\`. $HINT" ;;
		*)
			deny "Don't run scripts with pnpm ('pnpm $w2'). $HINT" ;;
		esac
		;;
	esac
done < <(sed -E "s/'[^']*'//g; s/\"[^\"]*\"//g" <<<"$cmd" | sed -E 's/(\&\&|\|\||[;|&])/\n/g')

exit 0
