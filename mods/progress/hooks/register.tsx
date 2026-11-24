import { atom, read, update } from "claude-code";
import type { EngineInterface, Register } from "claude-code";

import type { Lang, Row, Running, Snapshot } from "../types";
import { ago, block, clockText } from "./bar";

const PANE = "progress";
const QUIET_MS = 60_000;
const snapshot = atom({ plugin: "progress", key: "snapshot" } as const, null as Snapshot | null, {
  shape: "snapshot-1",
});
const running = atom({ plugin: "progress", key: "running" } as const, [] as Running[], {
  shape: "running-1",
});
const now = atom({ plugin: "progress", key: "now" } as const, 0);

const DESCRIPTION = `Report progress to the person: draws text progress bars and updates the Progress pane.
Call it at least once a minute during long work, in the same message as your next tool call.
Rows go in order: a running script, the current step, then the whole task. Example rows:
{"label":"Скрипт build-apk","percent":30,"leftMin":4,"totalMin":6}
{"label":"Шаг 1/7 Тесты","percent":35,"leftMin":7,"totalMin":40}
{"label":"Всего","percent":45,"leftMin":240,"totalMin":510}
Paste the returned block into your next message to the person, inside a code fence.`;

const ROW = {
  type: "object",
  required: ["label", "percent"],
  properties: {
    label: { type: "string", description: 'What the row measures: "Шаг 2/7 Сборка", "Всего".' },
    percent: { type: "number", minimum: 0, maximum: 100 },
    leftMin: { type: "number", description: "Minutes left, your estimate." },
    totalMin: { type: "number", description: "Minutes in all, your estimate." },
  },
};
const SCHEMA = {
  type: "object",
  required: ["rows"],
  properties: {
    rows: { type: "array", minItems: 1, maxItems: 6, items: ROW },
    lang: { type: "string", enum: ["ru", "en"], description: "The person's language. Default ru." },
  },
};

function labelOf(e: Record<string, unknown>): string {
  const what = e.description ?? e.command ?? e.file_path ?? e.prompt ?? "";
  return `${String(e.tool)}: ${String(what).slice(0, 60)}`;
}

let lastReport = 0;
let lastNudge = 0;
let turnStart = 0;
let stopTick: (() => void) | undefined;

async function report($: EngineInterface, e: unknown) {
  const input = e as unknown as { rows: Row[]; lang?: Lang };
  const lang: Lang = input.lang === "en" ? "en" : "ru";
  lastReport = await $.clock.now();
  await update($, snapshot, () => ({ rows: input.rows, lang, at: lastReport }));
  $.ui.open({ id: PANE, title: "Progress" }).catch(() => undefined);
  return {
    result: "```\n" + block(input.rows, lang) + "\n```\nPaste this block into your message.",
  };
}

export const register: Register = (on) => {
  on("session.start", async ($, e, next) => {
    await $.tool.register({
      name: "report",
      description: DESCRIPTION,
      inputSchema: SCHEMA,
      isDeferred: false,
    });
    await $.command.register({ name: "progress", description: "Show the progress pane" });
    return next(e);
  });

  on("command.run", { command: "progress" }, async ($) => {
    await $.ui.open({ id: PANE, title: "Progress" });
    return { text: "Progress pane opened." };
  });

  on("turn.start", async ($, e, next) => {
    if (e.agentId === undefined) {
      turnStart = await $.clock.now();
      lastReport = turnStart;
      stopTick?.();
      const tick = $.clock.every(5000, () => {
        $.clock
          .now()
          .then((t) => update($, now, () => t))
          .catch(() => undefined);
      });
      stopTick = () => tick.cancel();
    }
    return next(e);
  });

  on("turn.complete", async ($, e, next) => {
    if (e.agentId === undefined) {
      stopTick?.();
      stopTick = undefined;
      await update($, running, () => []);
    }
    return next(e);
  });

  // Served here, ahead of the permission check, so a report asks the person nothing.
  on("tool.call", async ($, e, next) => {
    if (e.tool === "mcp__progress__report") return report($, e);
    const main = e.agentId === undefined;
    const item: Running = {
      id: e.tool_use_id,
      label: labelOf(e as never),
      since: await $.clock.now(),
    };
    if (main) await update($, running, (list) => [...list, item]);
    const ran = await next(e);
    if (!main) return ran;
    await update($, running, (list) => list.filter((one) => one.id !== item.id));
    const t = await $.clock.now();
    const quiet = t - Math.max(lastReport, lastNudge);
    if (turnStart === 0 || t - turnStart < QUIET_MS || quiet < QUIET_MS || ran.deny !== undefined)
      return ran;
    lastNudge = t;
    const sec = Math.round((t - lastReport) / 1000);
    const note = `progress: ${sec} s since the last progress report. Call mcp__progress__report with your next tool call and paste its block into your message.`;
    return { ...ran, context: [...(ran.context ?? []), note] };
  }).catch(($, e, next) => next(e));

  on("ui.render", { component: "Pane", requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e);
    const shot = await read($, snapshot);
    const list = await read($, running);
    const t = Math.max(await read($, now), shot?.at ?? 0);
    const lang = shot?.lang ?? "ru";
    return (
      <Box flexDirection="column">
        {shot === null && <Text dimColor>No report yet.</Text>}
        {shot !== null &&
          block(shot.rows, lang)
            .split("\n")
            .map((l) => <Text>{l}</Text>)}
        {shot !== null && <Text dimColor>{ago(Math.round((t - shot.at) / 1000), lang)}</Text>}
        {list.map((one) => (
          <Text dimColor>{`${one.label}  ${clockText(Math.max(0, t - one.since))}`}</Text>
        ))}
      </Box>
    );
  });
};
