// The logic of turn-voice.cs for the Mac hook: what the phrase says, how it
// splits per language, how the clips join and which cue plays first.
import { readFileSync } from "node:fs";
import { basename } from "node:path";

export type Outcome =
  | "done"
  | "userSteps"
  | "notDone"
  | "running"
  | "error"
  | "ask"
  | "replied"
  | "archived";

// The last marker in the final message wins, so a marker quoted earlier doesn't count.
export function fromMarker(text: string): Outcome {
  const at: [Outcome, number][] = [
    ["notDone", text.lastIndexOf("NOT COMPLETED!!!")],
    ["done", text.lastIndexOf("!!!COMPLETED!!!")],
    ["running", text.lastIndexOf("!!!RUNNING!!!")],
    ["ask", text.lastIndexOf("!!!QUESTION!!!")],
    ["userSteps", text.lastIndexOf("!!!USER STEPS!!!")],
  ];
  const [outcome, last] = at.reduce((a, b) => (b[1] > a[1] ? b : a));
  return last < 0 ? "replied" : outcome;
}

const leads: Record<Outcome, [string, string]> = {
  done: ["сделал задачу", "finished the task"],
  userSteps: ["сделал свою часть, ждёт твоих шагов по задаче", "did its part, your steps wait on"],
  notDone: ["не закончил задачу", "did not finish the task"],
  running: ["работает в фоне над задачей", "is working in the background on"],
  error: ["упал с ошибкой на задаче", "stopped on an error in"],
  replied: ["ответил по задаче", "replied on"],
  archived: ["сделал задачу и заархивировал сессию", "finished and archived the task"],
  ask: ["ждёт ответа по задаче", "is waiting for your answer on"],
};

// The part before the task title, in the language picked at install.
export function lead(outcome: Outcome, ru: boolean, agent: string): string {
  return `${ru ? "Агент" : "Agent"} ${agent} ${leads[outcome][ru ? 0 : 1]}`;
}

// The project folder names the agent. Dashes would be read out, so they become spaces.
export function agentName(cwd: string | undefined): string {
  const name = basename((cwd ?? "").replace(/[\\/]+$/, "").replace(/\\/g, "/"));
  return name ? name.replace(/[-_.]+/g, " ") : "Claude";
}

// Emoji such as the ✅ marker prefix get read out by name, so they go before speech.
export const clean = (title: string): string =>
  title
    .replace(/"/g, "")
    .replace(/[\p{So}\p{Cs}]|\u{FE0E}|\u{FE0F}|\u{200D}|\u{20E3}/gu, "")
    .trim();

// Claude Code writes the session title into the transcript as customTitle,
// again on each rename. Kimi Code sends session_title. Codex sends none.
export function taskTitle(input: Record<string, unknown>): string | undefined {
  const path = input.transcript_path;
  if (typeof path !== "string" || !path) {
    return typeof input.session_title === "string"
      ? clean(input.session_title) || undefined
      : undefined;
  }
  let title: string | undefined;
  try {
    for (const line of readFileSync(path, "utf8").split("\n")) {
      if (!line.includes('"customTitle"')) continue;
      try {
        const value = JSON.parse(line).customTitle;
        if (typeof value === "string") title = value;
      } catch {}
    }
  } catch {}
  return title === undefined ? undefined : clean(title);
}

// A run starts at a Cyrillic or a Latin letter. Digits and signs stay with the run before them.
export function runs(text: string): string[] {
  const out: string[] = [];
  let head = "";
  for (const [m] of text.matchAll(
    /\p{Script=Cyrillic}[^A-Za-z]*|[A-Za-z][^\p{Script=Cyrillic}]*|[^A-Za-z\p{Script=Cyrillic}]+/gu,
  )) {
    if (!/[A-Za-z\p{Script=Cyrillic}]/u.test(m)) {
      head += m;
      continue;
    }
    const run = (head + m).trim();
    head = "";
    if (run) out.push(run);
  }
  return out;
}

export const cyrillic = (run: string): boolean => /\p{Script=Cyrillic}/u.test(run);
