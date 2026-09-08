#!/usr/bin/env bash
# Hook PostToolUse : lint le fichier front que l'agent vient d'ecrire et lui rend
# les erreurs. Sans node_modules, ne fait rien : jamais bloquant sur un poste
# qui n'a pas lance `npm ci`.
set -u

root="${CLAUDE_PROJECT_DIR:-$PWD}"
[ -f "$root/.stylelintrc.json" ] || exit 0
[ -d "$root/node_modules" ] || exit 0

file=$(python3 -c 'import json,sys; print(json.load(sys.stdin).get("tool_input",{}).get("file_path",""))' 2>/dev/null) || exit 0
[ -n "$file" ] && [ -f "$file" ] || exit 0

case "$file" in
    "$root"/public_addons/*|"$root"/enterprise/*|"$root"/omydoo/*|*/node_modules/*) exit 0 ;;
    *.scss) out=$(cd "$root" && npx --no-install stylelint "$file" 2>&1) ;;
    *.js) out=$(cd "$root" && npx --no-install eslint "$file" 2>&1) ;;
    *.xml) out=$(cd "$root" && python3 tools/lint-qweb.py "$file" 2>&1) ;;
    *) exit 0 ;;
esac

[ -n "$out" ] || exit 0
printf 'Lint front a corriger avant de continuer :\n%s\n' "$out" >&2
exit 2
