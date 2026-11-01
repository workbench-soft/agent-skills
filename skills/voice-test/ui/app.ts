// The voice-test page: pick the line, the groups and the voices, then play them.
// server.ts strips the types and serves this file as /app.js.

type Voice = { number: number; id: string; name: string; group: string; heading: string };
type Settings = { line: string; groups: string[]; lang: string; off: string[]; pitch: number };

const LINES: [string, string][] = [
  ["All 4", ""],
  ["English", "en"],
  ["Russian", "ru"],
  ["Mixed", "mix"],
  ["Chunks", "chunks"],
];
const GROUPS: [string, string][] = [
  ["Women", "female"],
  ["Men", "male"],
  ["Children", "child"],
];
const KEY = "voice-test";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const settings: Settings = load();
// Voices the person unticked. A voice that shows up after a filter change starts ticked.
const off = new Set(settings.off);
let voices: Voice[] = [];
let playing = false;

function load(): Settings {
  const fallback: Settings = {
    line: "chunks",
    groups: ["female", "male", "child"],
    lang: "en,ru",
    off: [],
    pitch: 0,
  };
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    return fallback;
  }
}

function save(): void {
  settings.off = [...off];
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // A blocked storage only loses the choices for the next start.
  }
}

function toggles(
  root: HTMLElement,
  items: [string, string][],
  pressed: (value: string) => boolean,
  onClick: (value: string) => void,
): void {
  root.replaceChildren(
    ...items.map(([text, value]) => {
      const button = document.createElement("button");
      button.textContent = text;
      button.setAttribute("aria-pressed", String(pressed(value)));
      button.onclick = () => onClick(value);
      return button;
    }),
  );
}

function renderFilters(): void {
  toggles(
    $("line"),
    LINES,
    (v) => settings.line === v,
    (v) => {
      settings.line = v;
      refresh();
    },
  );
  toggles(
    $("groups"),
    GROUPS,
    (v) => settings.groups.includes(v),
    (v) => {
      const has = settings.groups.includes(v);
      // At least one group stays on, or no voice would match.
      if (has && settings.groups.length === 1) return;
      settings.groups = has ? settings.groups.filter((g) => g !== v) : [...settings.groups, v];
      refresh();
    },
  );
  $<HTMLSelectElement>("lang").value = settings.lang;
  $<HTMLInputElement>("pitch").value = String(settings.pitch);
  showPitch();
}

function showPitch(): void {
  $("pitch-value").textContent = `${settings.pitch > 0 ? "+" : ""}${settings.pitch} Hz`;
}

async function api<T>(path: string, body?: object): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? res.statusText);
  return data as T;
}

async function refresh(): Promise<void> {
  renderFilters();
  save();
  $("voices-summary").textContent = "Loading…";
  try {
    voices = await api<Voice[]>("/api/voices", {
      line: settings.line,
      groups: settings.groups,
      lang: settings.lang,
    });
  } catch (e) {
    voices = [];
    note(`Could not list the voices: ${(e as Error).message}`);
  }
  renderVoices();
}

function picked(): Voice[] {
  return voices.filter((v) => !off.has(v.id));
}

function matches(voice: Voice): boolean {
  const query = $<HTMLInputElement>("voices-search").value.trim().toLowerCase();
  return !query || `${voice.name} ${voice.id}`.toLowerCase().includes(query);
}

// A wa-tree with a branch per group. Its checkboxes tick a whole group, and a
// group with part of its voices on shows a half tick.
function renderVoices(): void {
  const tree = document.createElement("wa-tree");
  tree.setAttribute("selection", "multiple");
  const groups = new Map<string, HTMLElement>();
  for (const voice of voices.filter(matches)) {
    let group = groups.get(voice.heading);
    if (!group) {
      group = document.createElement("wa-tree-item");
      group.setAttribute("expanded", "");
      const title = document.createElement("span");
      title.className = "group";
      title.textContent = voice.heading;
      group.append(title);
      groups.set(voice.heading, group);
      tree.append(group);
    }
    const item = document.createElement("wa-tree-item");
    item.dataset.id = voice.id;
    if (!off.has(voice.id)) item.setAttribute("selected", "");
    const id = document.createElement("small");
    id.textContent = voice.id;
    item.append(voice.name, id);
    group.append(item);
  }
  for (const group of groups.values()) {
    const count = document.createElement("span");
    count.className = "count";
    count.textContent = String(group.querySelectorAll("[data-id]").length);
    group.querySelector(".group")?.append(count);
  }
  tree.addEventListener("wa-selection-change", () => {
    for (const item of tree.querySelectorAll<HTMLElement & { selected: boolean }>(
      "wa-tree-item[data-id]",
    )) {
      if (item.selected) off.delete(item.dataset.id ?? "");
      else off.add(item.dataset.id ?? "");
    }
    save();
    summary();
  });
  $("voices-list").replaceChildren(tree);
  summary();
}

function summary(): void {
  const count = picked().length;
  $("voices-summary").textContent =
    count === voices.length ? `All ${count} voices` : `${count} of ${voices.length} voices`;
  $<HTMLButtonElement>("play").disabled = playing || count === 0;
}

function setAll(on: boolean): void {
  for (const v of voices.filter(matches)) {
    if (on) off.delete(v.id);
    else off.add(v.id);
  }
  save();
  renderVoices();
}

function openPanel(open: boolean): void {
  $("voices-panel").hidden = !open;
  $("voices-button").setAttribute("aria-expanded", String(open));
  if (open) $("voices-search").focus();
}

function note(text: string, kind = "note"): void {
  const li = document.createElement("li");
  li.className = kind;
  li.textContent = text;
  $("log").append(li);
  li.scrollIntoView({ block: "nearest" });
}

function setPlaying(on: boolean): void {
  playing = on;
  $<HTMLButtonElement>("stop").disabled = !on;
  $("status").textContent = on ? "Playing…" : "";
  summary();
}

async function play(): Promise<void> {
  const chosen = picked();
  $("log").replaceChildren();
  openPanel(false);
  setPlaying(true);
  try {
    await api("/api/play", {
      line: settings.line,
      groups: settings.groups,
      lang: settings.lang,
      ids: chosen.map((v) => v.id),
      pitch: settings.pitch,
    });
  } catch (e) {
    // No done event follows a failed start, so the page would say Playing for good.
    setPlaying(false);
    note(`Could not play: ${(e as Error).message}`);
  }
}

function onLine(text: string): void {
  // The script prints "   3  en-US-AvaNeural" as that voice starts.
  const match = text.match(/^\s*(\d+)\s+(\S+Neural)(.*)$/);
  if (!match) return note(text.trim());
  const voice = voices.find((v) => v.id === match[2]);
  $("now").textContent = `${match[1]}. ${voice?.name ?? match[2]}`;
  note(`${match[1].padStart(3)}  ${match[2]}${match[3]}`, "voice");
}

function listen(): void {
  const events = new EventSource("/api/events");
  events.onmessage = (e) => {
    const event = JSON.parse(e.data) as { type: string; text?: string };
    if (event.type === "line" && event.text) onLine(event.text);
    if (event.type === "done") {
      setPlaying(false);
      $("now").textContent = "Done. Note the numbers you liked.";
    }
  };
}

$("voices-button").onclick = (e) => {
  e.stopPropagation();
  openPanel($("voices-panel").hidden);
};
$("voices-panel").onclick = (e) => e.stopPropagation();
document.onclick = () => openPanel(false);
document.onkeydown = (e) => e.key === "Escape" && openPanel(false);
$("voices-search").oninput = renderVoices;
$("voices-all").onclick = () => setAll(true);
$("voices-none").onclick = () => setAll(false);
$<HTMLSelectElement>("lang").onchange = (e) => {
  settings.lang = (e.target as HTMLSelectElement).value;
  refresh();
};
$<HTMLInputElement>("pitch").oninput = (e) => {
  settings.pitch = Number((e.target as HTMLInputElement).value);
  showPitch();
  save();
};
$("play").onclick = () => void play();
$("stop").onclick = () =>
  void api("/api/stop").then(
    () => note("Stopped."),
    (e: Error) => note(`Could not stop: ${e.message}`),
  );

listen();
void refresh();
