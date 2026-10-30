# Browser rules

These apply to code running on the page. Every rule leaves the main thread open
for taps, scrolls and typing.

## Event listeners

- **Passive** touch and wheel listeners SHOULD pass `{ passive: true }` unless
  they call `preventDefault()`. Without it, scrolling waits on the listener.
- **Teardown** a listener added at setup SHOULD be removed at teardown. One
  `AbortController` signal removes a whole group in a single call.

```ts
const controller = new AbortController();
window.addEventListener("wheel", onWheel, { passive: true, signal: controller.signal });
window.addEventListener("resize", onResize, { signal: controller.signal });
// on teardown
controller.abort();
```

## Layout

A size read straight after a style write forces the browser to lay out the page
at once. In a loop, that costs a layout for every item.

- **Batch** layout reads SHOULD happen as a group, followed by the writes as a
  group.
- **One class** a set of style changes SHOULD come from a single class switch,
  not from properties set one by one.

```ts
// Bad: a layout per item
for (const el of items) el.style.height = `${el.scrollHeight}px`;
```

```ts
// Good: read all, then write all
const heights = items.map((el) => el.scrollHeight);
items.forEach((el, i) => (el.style.height = `${heights[i]}px`));
```

## localStorage

- **Versioned keys** a key SHOULD include a version: `settings:v2`. A changed
  shape takes a new key plus a migration from the old one.
- **What goes in** only fields the UI reads SHOULD be stored. A token or
  personal data SHOULD NOT, because every script on the page can read it.
- **`try`** each read and write SHOULD be wrapped in it. Private mode, a full
  quota and a broken saved value each throw.
- **Memory** a value read often SHOULD be read a single time and held in
  memory, since `getItem` blocks the main thread.

```ts
function loadSettings(): Settings | null {
  try {
    return JSON.parse(localStorage.getItem("settings:v2") ?? "null");
  } catch {
    return null;
  }
}
```

## Idle work

Work the user isn't waiting on, such as analytics or a prefetch, SHOULD run in
`requestIdleCallback` with a `timeout`. Safari lacks it, so the code falls back
to `setTimeout`.

```ts
const whenIdle = (task: () => void) =>
  "requestIdleCallback" in window
    ? requestIdleCallback(task, { timeout: 2000 })
    : setTimeout(task, 1);
whenIdle(() => track("search", { query }));
```
