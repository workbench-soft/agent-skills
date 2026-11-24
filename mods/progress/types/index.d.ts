export type Row = { label: string; percent: number; leftMin?: number; totalMin?: number };
export type Lang = "ru" | "en";
export type Snapshot = { rows: Row[]; lang: Lang; at: number };
export type Running = { id: string; label: string; since: number };

declare module "claude-code" {
  interface PluginState {
    progress: {
      snapshot: Shaped<Snapshot | null>;
      running: Shaped<Running[]>;
      now: number;
    };
  }
}
