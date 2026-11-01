#!/bin/sh
# Runs the install and the uninstall against a temporary $HOME and a copy of
# the repo. Start it from the repo root on Linux, macOS or Git Bash.
set -eux

# The skills of this checkout may be the ones the agents on this machine link
# to. A run here would rewrite their LANGUAGE.md and the clone's git hooks.
scratch=$(mktemp -d)
trap 'rm -rf "$scratch"' EXIT
copy_repo() {
  mkdir -p "$1"
  git ls-files -z | xargs -0 tar cf - | tar xf - -C "$1"
}

rules_file=writing-style.instructions.md

# Windows without Developer Mode gets a copy of the rules file.
has_rules_file() {
  case $(uname -s) in
    MINGW* | MSYS* | CYGWIN*) test -f "$1" ;;
    *) test -L "$1" ;;
  esac
}

home="$scratch/home1"
src="$scratch/src1"
copy_repo "$src"
mkdir -p "$home/.claude" "$home/.codex" "$home/AppData/Roaming/Code/User"
printf '# a note of my own\n' >"$home/.claude/CLAUDE.md"
# A real folder with a skill's name belongs to the user, not to the install.
mkdir -p "$home/.cursor/skills/review"
printf 'mine\n' >"$home/.cursor/skills/review/notes.md"
# An older install left other words in the block.
printf '# codex note\n\n%s\nFollow the old words.\n%s\n' \
  '<!-- agent-skills: writing rules -->' '<!-- agent-skills: end -->' >"$home/.codex/AGENTS.md"
HOME="$home" sh "$src/install.sh" --lang Spanish
test 1 -eq "$(grep -c 'agent-skills: writing rules' "$home/.codex/AGENTS.md")"
grep -qF "$rules_file" "$home/.codex/AGENTS.md"
if grep -q 'old words' "$home/.codex/AGENTS.md"; then exit 1; fi
for dir in "$home/.agents/skills" "$home/.claude/skills" "$home/.codex/skills"; do
  for name in review create-pr writing-style; do
    test -f "$dir/$name/SKILL.md"
  done
done
test -f "$home/.agents/skills/review/references/pr-links.md"
grep -qx Spanish "$home/.agents/skills/review/LANGUAGE.md"
# The files sit in the repo only. Each agent folder holds links.
test 0 -eq "$(find "$home" -name SKILL.md -type f | wc -l)"
# The rules land where each agent reads them on every turn.
has_rules_file "$home/.agents/$rules_file"
has_rules_file "$home/AppData/Roaming/Code/User/prompts/$rules_file"
test -f "$home/.codex/AGENTS.md"
HOME="$home" sh "$src/install.sh" --lang Spanish
test 1 -eq "$(grep -c 'agent-skills: writing rules' "$home/.claude/CLAUDE.md")"
# A link left by a clone that was deleted goes on uninstall too.
rm -f "$home/.codex/skills/create-pr"
mkdir -p "$scratch/gone/skills/create-pr"
# Windows without Developer Mode makes no symlink, so the case is skipped.
MSYS=winsymlinks:nativestrict ln -s "$scratch/gone/skills/create-pr" "$home/.codex/skills/create-pr" || true
rm -rf "$scratch/gone"
HOME="$home" sh "$src/install.sh" --uninstall --yes
test ! -L "$home/.codex/skills/create-pr"
test ! -e "$home/.claude/skills/review"
test ! -e "$home/.agents/$rules_file"
test ! -e "$home/AppData/Roaming/Code/User/prompts/$rules_file"
grep -qx '# codex note' "$home/.codex/AGENTS.md"
if grep -q agent-skills "$home/.codex/AGENTS.md"; then exit 1; fi
grep -qx '# a note of my own' "$home/.claude/CLAUDE.md"
test -f "$home/.cursor/skills/review/notes.md"
if grep -q agent-skills "$home/.claude/CLAUDE.md"; then exit 1; fi
# The uninstall took the links and left the source files.
test -f "$src/skills/review/SKILL.md"

# A block that lost its end line stays, along with the lines after it.
home="$scratch/home4"
mkdir -p "$home/.claude"
printf '%s\n@old\n# my later rule\n' '<!-- agent-skills: writing rules -->' >"$home/.claude/CLAUDE.md"
# No --lang, no language from a last run and no terminal: English.
src="$scratch/src4"
copy_repo "$src"
# Skipped in a terminal, where the prompt would wait for an answer.
if ! (: </dev/tty) 2>/dev/null; then
  HOME="$home" sh "$src/install.sh" </dev/null
  grep -qx English "$home/.claude/skills/review/LANGUAGE.md"
else
  HOME="$home" sh "$src/install.sh" --lang English
fi
HOME="$home" sh "$src/install.sh" --uninstall --yes
grep -qx '# my later rule' "$home/.claude/CLAUDE.md"

# A CLAUDE.md that links into dotfiles stays a link through the refresh and
# the uninstall.
home="$scratch/home5"
mkdir -p "$home/.claude" "$home/dotfiles"
printf '%s\n@old/path\n%s\n' '<!-- agent-skills: writing rules -->' '<!-- agent-skills: end -->' >"$home/dotfiles/CLAUDE.md"
if MSYS=winsymlinks:nativestrict ln -s "$home/dotfiles/CLAUDE.md" "$home/.claude/CLAUDE.md"; then
  HOME="$home" sh "$src/install.sh" --lang Spanish
  test -L "$home/.claude/CLAUDE.md"
  grep -qF "$rules_file" "$home/dotfiles/CLAUDE.md"
  HOME="$home" sh "$src/install.sh" --uninstall --yes
  test -L "$home/.claude/CLAUDE.md"
  test -f "$home/dotfiles/CLAUDE.md"
fi

# A temp file that can't be written leaves CLAUDE.md as it was. A folder in
# its place makes the write fail on every system.
home="$scratch/home6"
mkdir -p "$home/.claude/CLAUDE.md.agent-skills.tmp"
printf '# keep me\n\n%s\n@old\n%s\n' '<!-- agent-skills: writing rules -->' '<!-- agent-skills: end -->' >"$home/.claude/CLAUDE.md"
HOME="$home" sh "$src/install.sh" --lang Spanish
grep -qx '# keep me' "$home/.claude/CLAUDE.md"
HOME="$home" sh "$src/install.sh" --uninstall --yes
grep -qx '# keep me' "$home/.claude/CLAUDE.md"

# An old bug: the uninstall emptied the folder the agents link to, and the
# next install found no skills to link.
home="$scratch/home2"
mkdir -p "$home/.claude"
copy_repo "$home/.agent-skills"
# A clone, so install.sh links it rather than cloning over it.
git -C "$home/.agent-skills" init -q
HOME="$home" AGENT_SKILLS_DIR="$home/.agent-skills" sh -s -- --lang Spanish <install.sh
test -f "$home/.claude/skills/review/SKILL.md"
# A trailing slash spells the same folder another way.
HOME="$home" AGENT_SKILLS_DIR="$home/.agent-skills/" sh -s -- --uninstall --yes <install.sh
test -f "$home/.agent-skills/skills/review/SKILL.md"
HOME="$home" AGENT_SKILLS_DIR="$home/.agent-skills" sh -s -- --lang Spanish <install.sh
test -f "$home/.claude/skills/review/SKILL.md"

# The git hook links a skill merged into the clone, with no rerun. A skill
# deleted from the clone loses its link.
home="$scratch/home3"
mkdir -p "$home/.claude"
src="$home/src"
copy_repo "$src"
in_src() { HOME="$home" git -C "$src" -c user.name=test -c user.email=test@example.com "$@"; }
in_src init -q -b main
in_src add -A
in_src commit -q -m base
HOME="$home" sh "$src/install.sh" --lang Spanish
grep -qF 'agent-skills: relink hook' "$src/.git/hooks/post-merge"
in_src checkout -q -b side
mkdir "$src/skills/zz-new"
printf -- '---
name: zz-new
description: test
---
' >"$src/skills/zz-new/SKILL.md"
in_src add skills/zz-new
in_src commit -q -m new
in_src checkout -q main
test ! -e "$home/.claude/skills/zz-new"
in_src merge -q --ff-only side
test -f "$home/.claude/skills/zz-new/SKILL.md"
grep -qx Spanish "$src/skills/zz-new/LANGUAGE.md"
in_src reset -q --hard HEAD~1
in_src checkout -q side
in_src checkout -q main
test ! -e "$home/.claude/skills/zz-new"
test ! -L "$home/.claude/skills/zz-new"
HOME="$home" sh "$src/install.sh" --uninstall --yes
test ! -e "$src/.git/hooks/post-merge"

echo "install test passed"
