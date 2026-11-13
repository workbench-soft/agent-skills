#!/bin/sh
# Removes a finished worktree: its folder, its local branch and its remote branch.
# It stops when the worktree holds work that hasn't landed.
# Usage: sh remove-merged.sh <worktree> [--dropped] [--keep-remote]
#   --dropped      the person dropped the work, so the PR needs no merge
#   --keep-remote  someone else's branch, so only the folder and the local branch go
set -eu

stop() {
  echo "kept $dir: $1" >&2
  exit 1
}

dir=${1:?usage: sh remove-merged.sh <worktree> [--dropped] [--keep-remote]}
shift
dropped=no
keep_remote=no
for flag in "$@"; do
  case $flag in
    --dropped) dropped=yes ;;
    --keep-remote) keep_remote=yes ;;
    *) stop "unknown flag $flag" ;;
  esac
done

[ -d "$dir" ] || stop "no such folder"
dir=$(cd "$dir" && pwd -P)
main=$(git -C "$dir" worktree list --porcelain | sed -n '1s/^worktree //p')
main=$(cd "$main" && pwd -P)
[ "$dir" != "$main" ] || stop "it is the main checkout"
case $PWD/ in "$dir"/*) stop "this shell is inside it, cd out first" ;; esac

branch=$(git -C "$dir" branch --show-current)
remote=$(git -C "$dir" config "branch.$branch.remote" 2>/dev/null || echo origin)
git -C "$dir" fetch -q "$remote" 2>/dev/null || true
default=$(git -C "$dir" symbolic-ref -q --short "refs/remotes/$remote/HEAD" 2>/dev/null | sed "s#^$remote/##")
default=${default:-main}
[ "$branch" != "$default" ] || stop "it holds the default branch"

[ -z "$(git -C "$dir" status --short)" ] || stop "uncommitted or untracked files"
if [ -n "$branch" ] && git -C "$dir" stash list | grep -qE "(WIP on|On) $branch:"; then
  stop "a stash of $branch"
fi

if [ "$dropped" = no ]; then
  if [ -n "$branch" ]; then
    pr=$(cd "$dir" && env GH_PAGER=cat gh pr view "$branch" --json state,headRefOid -q '.state + " " + .headRefOid') ||
      stop "no PR for $branch"
    [ "${pr%% *}" = MERGED ] || stop "its PR is ${pr%% *}"
    [ "$(git -C "$dir" rev-parse HEAD)" = "${pr#* }" ] || stop "HEAD is not the PR head"
  else
    git -C "$dir" merge-base --is-ancestor HEAD "$remote/$default" ||
      stop "the detached HEAD is not on $remote/$default"
  fi
fi

# A rename takes under a second. Deleting node_modules in place holds the agent for minutes.
trash="$(dirname "$main")/.trash"
mkdir -p "$trash"
mv "$dir" "$trash/$(basename "$dir")-$(date +%s)" || stop "a process holds a file in it"
git -C "$main" worktree prune
if [ -n "$branch" ]; then
  git -C "$main" branch -D "$branch"
  if [ "$keep_remote" = no ] && git -C "$main" ls-remote --exit-code --heads "$remote" "$branch" >/dev/null; then
    git -C "$main" push -q "$remote" --delete "$branch"
  fi
fi

# The trash empties in the background. rd leaves the targets of pnpm junctions alone.
case $(uname -s) in
  MINGW* | MSYS* | CYGWIN*)
    powershell -NoProfile -Command "Start-Process cmd -WindowStyle Hidden -ArgumentList '/c','rd /s /q \"$(cygpath -w "$trash")\"'"
    ;;
  *) (rm -rf "$trash" >/dev/null 2>&1 &) ;;
esac
echo "removed $dir${branch:+ and branch $branch}"
