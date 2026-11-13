// remove-merged.sh against a scratch repo with a bare remote. The PR check needs
// GitHub, so these runs use --dropped or a detached HEAD on the default branch.
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";

const script = new URL(
  "../skills/git-worktrees/scripts/remove-merged.sh",
  import.meta.url,
).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const root = mkdtempSync(join(tmpdir(), "remove-merged-"));
after(() => rmSync(root, { recursive: true, force: true }));
const git = (cwd: string, ...args: string[]) =>
  execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...args], {
    cwd,
    encoding: "utf8",
  }).trim();
const remove = (cwd: string, ...args: string[]) =>
  spawnSync("sh", [script, ...args], { cwd, encoding: "utf8" });

git(root, "init", "-q", "--bare", "-b", "main", "remote.git");
git(root, "clone", "-q", "remote.git", "repo");
const repo = join(root, "repo");
git(repo, "commit", "-q", "--allow-empty", "-m", "start");
git(repo, "push", "-q", "origin", "main");
git(repo, "remote", "set-head", "origin", "main");

test("removes a dropped worktree with its local and remote branch", () => {
  git(repo, "worktree", "add", "-q", "-b", "feat", "../feat");
  git(join(root, "feat"), "push", "-q", "-u", "origin", "feat");
  const run = remove(repo, join(root, "feat"), "--dropped");
  assert.equal(run.status, 0, run.stderr);
  assert.ok(!existsSync(join(root, "feat")));
  assert.equal(git(repo, "branch", "--list", "feat"), "");
  assert.equal(git(repo, "ls-remote", "--heads", "origin", "feat"), "");
});

test("keeps a worktree with an untracked file", () => {
  git(repo, "worktree", "add", "-q", "-b", "wip", "../wip");
  writeFileSync(join(root, "wip", "notes.md"), "draft\n");
  const run = remove(repo, join(root, "wip"), "--dropped");
  assert.equal(run.status, 1);
  assert.match(run.stderr, /uncommitted or untracked/);
  assert.ok(existsSync(join(root, "wip")));
});

test("removes a detached worktree once its HEAD is on main", () => {
  git(repo, "worktree", "add", "-q", "--detach", "../done", "main");
  const run = remove(repo, join(root, "done"));
  assert.equal(run.status, 0, run.stderr);
  assert.ok(!existsSync(join(root, "done")));
});

test("keeps a detached worktree with a commit that is not on main", () => {
  git(repo, "worktree", "add", "-q", "--detach", "../ahead", "main");
  git(join(root, "ahead"), "commit", "-q", "--allow-empty", "-m", "local only");
  const run = remove(repo, join(root, "ahead"));
  assert.equal(run.status, 1);
  assert.match(run.stderr, /not on origin\/main/);
});

test("keeps the main checkout", () => {
  const run = remove(root, repo, "--dropped");
  assert.equal(run.status, 1);
  assert.match(run.stderr, /main checkout/);
});
