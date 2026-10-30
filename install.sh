#!/bin/sh
# Links every skill in this repo into each coding agent found on this machine.
# Run it from a clone, or pipe it to sh and it clones into ~/.agent-skills.
set -eu

repo=https://github.com/workbench-soft/agent-skills.git
lang=""
uninstall=0
yes=0
rules_file=writing-style.instructions.md
rules_open='<!-- agent-skills: writing rules -->'
rules_close='<!-- agent-skills: end -->'
hook_marker='# agent-skills: relink hook'
hook_names="post-merge post-checkout post-rewrite"

# Set so the pull below, or a run a hook started, doesn't start the hooks again.
AGENT_SKILLS_HOOK=1
export AGENT_SKILLS_HOOK

# Each agent reads these files on every turn, so the writing rules apply
# unasked. Claude follows an @path. Codex gets the path spelled out.
claude_rules="$HOME/.claude/CLAUDE.md"
codex_rules="$HOME/.codex/AGENTS.md"

# Each agent's global skills folder under $HOME, without the /skills at the
# end. Only agents already installed get a link.
agent_homes="
.adal
.agents
.aider-desk
.astrbot/data
.augment
.autohand
.bob
.claude
.codeartsdoer
.codebuddy
.codeium/windsurf
.codemaker
.codestudio
.codex
.commandcode
.config/crush
.config/devin
.config/goose
.continue
.copilot
.cursor
.factory
.forge
.hermes
.iflow
.inferencesh
.jazz
.junie
.kilocode
.kiro
.kode
.lingma
.mcpjam
.moxby
.mux
.neovate
.ona
.openclaw
.openhands
.pi/agent
.pochi
.qoder
.qoder-cn
.qwen
.reasonix
.roo
.rovodev
.snowflake/cortex
.tabnine/agent
.terramind
.tinycloud
.trae
.trae-cn
.vibe
.zcode
.zencoder
"

usage() {
  cat <<'EOF'
Usage: ./install.sh [--lang <language>]
       ./install.sh --uninstall [--yes]

  --lang <language>  Language for the long review text. Default English.
                     Example: --lang Russian
  --uninstall        Remove these skills from every agent folder on this
                     machine. Lists what it found and asks first.
  --yes              Answer yes to the uninstall question.

The skills live in one folder and every agent gets a symlink to it, so there is
only ever one copy to edit. Git hooks in that folder run the install again
after a pull, so new skills get linked. Run it again after you install a new
agent. A rerun keeps the language picked last time.
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --lang | -l)
      [ $# -ge 2 ] || {
        echo "--lang needs a language" >&2
        exit 1
      }
      lang=$2
      shift 2
      ;;
    --uninstall)
      uninstall=1
      shift
      ;;
    --yes | -y)
      yes=1
      shift
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      echo "unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

# Not inside a clone: get the skills before linking them.
if [ -f "$0" ] && [ -d "$(dirname "$0")/skills" ]; then
  root=$(cd "$(dirname "$0")" && pwd)
else
  root=${AGENT_SKILLS_DIR:-$HOME/.agent-skills}
  if [ -d "$root/.git" ]; then
    # A failed pull, offline or on a detached commit, falls back to the disk.
    git -C "$root" pull --ff-only --quiet ||
      echo "could not refresh $root, installing the copy on disk" >&2
    # A pull doesn't restore files deleted by hand, so check them out again.
    [ -z "$(git -C "$root" ls-files -d)" ] || git -C "$root" checkout --quiet -- .
  else
    git clone --quiet --depth 1 "$repo" "$root"
  fi
fi

have_skills=0
for dir in "$root"/skills/*/; do
  if [ -d "$dir" ]; then have_skills=1; fi
done
if [ "$have_skills" -eq 0 ]; then
  echo "no skills in $root/skills, nothing to install" >&2
  exit 1
fi

prompt_user() {
  if [ -t 0 ]; then
    printf '%s' "$1"
    read -r answer || answer=""
  # An agent shell or CI has a /dev/tty that fails to open.
  elif (: </dev/tty) 2>/dev/null; then
    printf '%s' "$1" >/dev/tty
    read -r answer </dev/tty || answer=""
  else
    answer=""
  fi
}

# Quoted everywhere, since "Application Support" has a space in it.
# On Windows the last path is %APPDATA%\Code\User.
vscode_dirs="$HOME/Library/Application Support/Code/User
$HOME/.config/Code/User
$HOME/AppData/Roaming/Code/User"

# Git Bash copies on ln -s unless told otherwise, and a real symlink takes
# Developer Mode. Without it folders get junctions, which need no rights, and
# the rules file gets a copy that each run refreshes.
link_kind=symlink
case $(uname -s) in
  MINGW* | MSYS* | CYGWIN*)
    MSYS=winsymlinks:nativestrict
    CYGWIN=winsymlinks:nativestrict
    export MSYS CYGWIN
    probe=$(mktemp -d)
    : >"$probe/file"
    ln -s "$probe/file" "$probe/link" 2>/dev/null || link_kind=junction
    rm -rf "$probe"
    ;;
esac

make_link() {
  if [ "$link_kind" = symlink ]; then
    ln -sfn "$1" "$2"
    return
  fi
  rm -f "$2"
  if [ -d "$1" ]; then
    # Stops Git Bash from turning /c and /J into Windows paths.
    MSYS2_ARG_CONV_EXCL='*' cmd /c mklink /J "$(cygpath -w "$2")" "$(cygpath -w "$1")" >/dev/null
  else
    cp "$1" "$2"
  fi
}

append_rules_block() {
  file=$1
  body=$2
  dir=${file%/*}
  if [ ! -d "$dir" ]; then return 0; fi
  if [ -f "$file" ] && grep -qxF "$rules_open" "$file"; then
    if grep -qxF "$body" "$file"; then return 0; fi
    # An older install wrote other words. Swap the block for the new one.
    strip_rules_block "$file" || return 0
  elif [ -f "$file" ] && grep -qF "$rules_file" "$file"; then
    # The person wired the rules in by hand.
    return 0
  fi
  # Exactly one blank line before the block, after any number of runs.
  if [ -s "$file" ] && [ -n "$(tail -n 1 "$file")" ]; then printf '\n' >>"$file"; fi
  printf '%s\n%s\n%s\n' "$rules_open" "$body" "$rules_close" >>"$file"
  echo "Writing rules wired into $file"
}

strip_rules_block() {
  file=$1
  if [ ! -f "$file" ]; then return 0; fi
  if ! grep -qF "$rules_open" "$file"; then return 0; fi
  # Without the end line the strip would take every line after the block.
  if ! grep -qxF "$rules_close" "$file"; then
    echo "Left $file alone, its agent-skills block has no end line. Remove the block by hand." >&2
    return 1
  fi
  tmp="$file.agent-skills.tmp"
  awk -v s="$rules_open" -v e="$rules_close" '
    $0 == s { skip = 1; next }
    $0 == e { skip = 0; next }
    skip != 1 { print }
  ' "$file" >"$tmp"
  # Written through, so a CLAUDE.md that links into dotfiles stays a link.
  cat "$tmp" >"$file"
  rm -f "$tmp"
  # Only the block was in the file, so the install made the file. A link
  # points at the person's own file, which stays.
  if [ ! -s "$file" ] && [ ! -L "$file" ]; then rm -f "$file"; fi
}

link_writing_rules() {
  make_link "$root/$rules_file" "$HOME/.agents/$rules_file"

  old_ifs=$IFS
  IFS='
'
  for dir in $vscode_dirs; do
    [ -d "$dir" ] || continue
    mkdir -p "$dir/prompts"
    make_link "$root/$rules_file" "$dir/prompts/$rules_file"
    echo "VS Code reads the writing rules from $dir/prompts"
  done
  IFS=$old_ifs

  append_rules_block "$claude_rules" "@~/.agents/$rules_file"
  append_rules_block "$codex_rules" "Follow ~/.agents/$rules_file: how to write text a person reads."
}

# Worktrees share hooks with the main clone and get deleted when done, so
# they get no hooks of their own.
git_hooks_path() {
  [ -d "$root/.git" ] || return 1
  git -C "$root" rev-parse --path-format=absolute --git-path hooks 2>/dev/null
}

install_relink_hooks() {
  dir=$(git_hooks_path) || return 0
  mkdir -p "$dir"
  quoted=$(printf '%s' "$root/install.sh" | sed "s/'/'\\''/g")
  for name in $hook_names; do
    file="$dir/$name"
    if [ -f "$file" ] && ! grep -qF "$hook_marker" "$file"; then
      echo "Left $file alone, it is someone else's. Run the install by hand after a pull."
      continue
    fi
    cat >"$file" <<EOF
#!/bin/sh
$hook_marker
# Relinks the skills into every agent once git has changed the files.
[ -z "\${AGENT_SKILLS_HOOK:-}" ] || exit 0
sh '$quoted' > /dev/null 2>&1 || true
EOF
    chmod +x "$file"
  done
}

if [ "$uninstall" -eq 1 ]; then
  doomed=""
  listing=""
  # .[!.]* keeps the glob from matching .. and climbing out of $HOME.
  for parent in "$HOME"/.[!.]*/skills "$HOME"/.[!.]*/*/skills; do
    [ -d "$parent" ] || continue
    # Skip the source folder the agents link to, however its path is spelled.
    # shellcheck disable=SC3013 # dash, bash and busybox sh all have -ef
    if [ "$parent" -ef "$root/skills" ]; then continue; fi
    for dir in "$root"/skills/*/; do
      dir=${dir%/}
      target="$parent/${dir##*/}"
      # A link to this clone goes, and so does a broken link to a clone that
      # moved or was deleted. A real folder there is the user's.
      # shellcheck disable=SC3013
      if [ "$target" -ef "$dir" ] || { [ -L "$target" ] && [ ! -e "$target" ] &&
        case $(readlink "$target") in */skills/"${dir##*/}") true ;; *) false ;; esac } then
        doomed="$doomed$target
"
        listing="$listing$parent
"
      fi
    done
  done
  listing=$(printf '%s' "$listing" | sort -u)

  old_ifs=$IFS
  IFS='
'
  for dir in $vscode_dirs; do
    rules="$dir/prompts/$rules_file"
    if [ -e "$rules" ] || [ -L "$rules" ]; then
      doomed="$doomed$rules
"
      listing="$listing
$rules"
    fi
  done
  IFS=$old_ifs

  # A symlink, or a copy on Windows without Developer Mode.
  if [ -e "$HOME/.agents/$rules_file" ] || [ -L "$HOME/.agents/$rules_file" ]; then
    doomed="$doomed$HOME/.agents/$rules_file
"
    listing="$listing
$HOME/.agents/$rules_file"
  fi

  if dir=$(git_hooks_path); then
    for name in $hook_names; do
      if [ -f "$dir/$name" ] && grep -qF "$hook_marker" "$dir/$name"; then
        doomed="$doomed$dir/$name
"
        listing="$listing
$dir/$name"
      fi
    done
  fi

  rule_files=""
  for file in "$claude_rules" "$codex_rules"; do
    if [ -f "$file" ] && grep -qF "$rules_open" "$file"; then
      rule_files="$rule_files$file
"
      listing="$listing
$file (the writing rules block only)"
    fi
  done

  if [ -z "$doomed" ] && [ -z "$rule_files" ]; then
    echo "nothing to remove"
    exit 0
  fi

  echo "About to delete these skills from:"
  printf '%s\n' "$listing" | sed 's/^/  /'

  if [ "$yes" -ne 1 ]; then
    prompt_user 'Delete these? [y/N]: '
    case "$answer" in
      y | Y | yes | YES) ;;
      *)
        echo "left alone"
        exit 0
        ;;
    esac
  fi

  old_ifs=$IFS
  IFS='
'
  for target in $doomed; do
    rm -rf "${target:?}"
  done
  for file in $rule_files; do
    strip_rules_block "$file" || true
  done
  IFS=$old_ifs
  echo "removed. The folder in $root is still there, delete it by hand if you want it gone."
  exit 0
fi

# With no --lang, a rerun by hand or by a hook reuses the last language.
if [ -z "$lang" ]; then
  for file in "$root"/skills/*/LANGUAGE.md; do
    if [ -f "$file" ]; then
      lang=$(head -n 1 "$file")
      break
    fi
  done
fi

if [ -z "$lang" ]; then
  prompt_user 'Language for the long review text [English]: '
  lang=$answer
fi
[ -n "$lang" ] || lang=English

# Any script works. A slash or a newline would break the file it lands in.
case "$lang" in
  */* | *'
'*)
    echo "a language name cannot hold a slash or a line break: $lang" >&2
    exit 1
    ;;
esac

for dir in "$root"/skills/*/; do
  printf '%s\n' "$lang" >"$dir/LANGUAGE.md"
done

linked=""
skipped=""
for agent in $agent_homes; do
  # Several agents read .agents, so it gets made even when missing.
  if [ "$agent" != ".agents" ] && [ ! -d "$HOME/$agent" ]; then
    continue
  fi
  mkdir -p "$HOME/$agent/skills"
  # Drop links to skills deleted from the repo. They point at no folder, or
  # at one with only the ignored LANGUAGE.md left.
  for target in "$HOME/$agent/skills"/*; do
    if [ -L "$target" ] && [ ! -f "$target/SKILL.md" ]; then
      case $(readlink "$target") in
        "$root"/skills/*) rm -f "$target" ;;
      esac
    fi
  done
  for dir in "$root"/skills/*/; do
    dir=${dir%/}
    [ -f "$dir/SKILL.md" ] || continue
    # Parameter expansion, since each basename or ln costs about 0.1 s in
    # Git Bash, times every skill and every agent.
    target="$HOME/$agent/skills/${dir##*/}"
    # shellcheck disable=SC3013 # dash, bash and busybox sh all have -ef
    if [ "$target" -ef "$dir" ]; then continue; fi
    if [ -e "$target" ] && [ ! -L "$target" ]; then
      skipped="$skipped  $target
"
      continue
    fi
    make_link "$dir" "$target"
  done
  linked="$linked $agent"
done

link_writing_rules
install_relink_hooks

echo "Skills live in $root, report language $lang."
echo "Linked into:$linked"

if [ "$link_kind" = junction ]; then
  echo "Developer Mode is off, so the skill folders are junctions and $rules_file is a copy."
  echo "Run the install again after you edit $rules_file, or turn on Developer Mode for real links."
fi

if [ -n "$skipped" ]; then
  printf 'Left alone, something real is already sitting there:\n%s' "$skipped"
fi
