// Fails when a paragraph or list item of an agent doc holds no BCP 14 key word,
// or holds one in lowercase outside code and quotes.
// Headings, tables, code blocks, quotes, front matter and tool managed blocks are left out.
import { globSync, readFileSync } from "node:fs";

// Takes globs, since cmd on Windows passes them through unexpanded.
const files = process.argv.slice(2).flatMap((arg) => globSync(arg));
const keyword = /\b(MUST|SHOULD|MAY|REQUIRED|SHALL|RECOMMENDED|OPTIONAL)\b/;
const lowercase = /\b(must|should|may|shall)\b/;
let failed = 0;

for (const file of files) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  let block: { start: number; text: string } | null = null;
  let fence = "";
  let managed = false;
  let front = lines[0] === "---";
  const flush = () => {
    const prose = block?.text.replace(/`[^`]*`|"[^"]*"/g, "") ?? "";
    if (block && !keyword.test(block.text))
      report(block.start, "no MUST, SHOULD or MAY", block.text);
    else if (block && lowercase.test(prose)) report(block.start, "lowercase key word", block.text);
    block = null;
  };
  const report = (line: number, why: string, text: string) => {
    console.error(`${file}:${line} ${why}: ${text.trim().slice(0, 70)}`);
    failed++;
  };
  lines.forEach((line, i) => {
    if (front) {
      if (i > 0 && line === "---") front = false;
      return;
    }
    // A tool writes the block between BEGIN and END markers, such as Next.js in AGENTS.md.
    if (line.startsWith("<!-- BEGIN:")) managed = true;
    if (managed) {
      if (line.startsWith("<!-- END:")) managed = false;
      return flush();
    }
    // A fence closes only on the same character, at least as long, so nested examples stay inside.
    const mark = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    if (mark && !fence) fence = mark;
    else if (mark && mark[0] === fence[0] && mark.length >= fence.length && line.trim() === mark) {
      fence = "";
      return flush();
    }
    if (fence) return flush();
    if (line.trim() === "" || /^\s*(#|\||>|<!--)/.test(line)) return flush();
    if (/^(\s*)([-*]|\d+\.)\s/.test(line) && !/^\s{4,}/.test(line)) flush();
    block ??= { start: i + 1, text: "" };
    block.text += ` ${line.trim()}`;
  });
  flush();
}

if (failed) process.exit(1);
