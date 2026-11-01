---
name: javascript
description: 'Use when JavaScript or TypeScript code is being written, sped up or reviewed, in any repository and in any language: "make it faster", "why is this page slow", "the bundle is too big", "check the async code", "ускорь код", "почему страница тормозит". It works out where the code runs, then applies the rules that cut round trips, bundle size and main thread work: independent awaits run together, request data stays out of module scope, heavy imports load on use, lookups go through a Map. In a review, every finding gives the rule, the line and its cost.'
---

# JavaScript

The agent MUST apply these rules to JS and TS where a mistake costs real time
or real data: an extra round trip, a slow first screen, a response that holds
another user's data.

The repo's lint rules and skills MUST beat this file. Rules for React and other
frameworks belong to that framework's skill.

## 1. Find where the code runs

- **Server** the agent MUST treat Node, Bun, Deno, a serverless function and
  server rendering as server code.
- **Browser** the agent MUST treat whatever ships in a bundle as browser code.
- **Both** a shared module or a server rendered component MUST follow both
  sets of rules.

The async, server and data rules below MUST apply to all of them. Code shipped
to a browser MUST follow these as well:

- **Bundle** for imports, lazy loading and third party scripts, the agent MUST
  read [references/bundle.md](references/bundle.md).
- **Browser** for listeners, layout, `localStorage` and idle work, the agent
  MUST read [references/browser.md](references/browser.md).

## 2. Async

### Run independent calls together

Calls that don't depend on each other's result SHOULD start at the same time.

```ts
// Bad: 3 round trips, one after another
const user = await getUser(id);
const orders = await getOrders(id);
const prefs = await getPrefs(id);
```

```ts
// Good: 1 round trip
const [user, orders, prefs] = await Promise.all([getUser(id), getOrders(id), getPrefs(id)]);
```

### Start early, await late

A call that depends on one result SHOULD chain only on that promise, so the
rest of the calls go ahead without it.

```ts
const userP = getUser(id);
const ordersP = userP.then((user) => getOrders(user.accountId));
const [user, orders, config] = await Promise.all([userP, ordersP, getConfig()]);
```

On every path, a promise started early MUST be awaited or caught. An early
return that leaves it pending causes an unhandled rejection, and by default Node
exits on one.

### Await where the value is used

- **In the branch** an `await` SHOULD sit where its value is read, so an early
  return skips the call.
- **Cheap check first** a fast sync check SHOULD come before an awaited flag:
  `if (isAdmin && (await getFlag("export")))`. If the check has side effects or
  needs the flag, keep the old order.

```ts
// Bad: loads permissions even when the doc is missing
const perms = await getPerms(userId);
const doc = await getDoc(docId);
if (!doc) return notFound();
```

```ts
// Good
const doc = await getDoc(docId);
if (!doc) return notFound();
const perms = await getPerms(userId);
```

### Loops and failures

- **Loops** an `await` in a loop over independent items SHOULD turn into
  `Promise.all(items.map(...))`.
- **Many items** hundreds of them, or an API with a rate limit, SHOULD run
  under a concurrency cap such as `p-limit`.
- **Failures** `Promise.all` rejects at the first failure and loses the other
  results. If each result matters by itself, the code SHOULD use
  `Promise.allSettled` and MUST deal with every `rejected` entry.

## 3. Server

- **Request data** the user, the tenant and the like MUST NOT live in a module
  level variable. Concurrent requests share the module, so a response can carry
  another user's data. Pass it as an argument, or use `AsyncLocalStorage`.
- **Module scope** it MAY hold what every request shares: config, a database
  client, a cache keyed by request data.

```ts
// Bad: request B overwrites the user before request A reads it
let currentUser: User | null = null;
export async function handler(req: Request) {
  currentUser = await auth(req);
  return render();
}
```

## 4. Data

- **Lookups** repeated lookups by key SHOULD use a `Map` built a single time. A
  `find` inside `map` scans the whole array for each item.
- **Membership** checks against a list SHOULD use a `Set`: `allowed.has(id)`.
- **Given arrays** a function MUST NOT reorder an array passed to it. `sort`,
  `reverse` and `splice` change the caller's array, React state too. Use
  `toSorted`, `toReversed`, `toSpliced` or `with` (Node 20 and up), or copy
  first: `[...items].sort(byName)`.

```ts
// Bad: users.find runs once per order
orders.map((order) => ({ ...order, user: users.find((u) => u.id === order.userId) }));
```

```ts
// Good
const userById = new Map(users.map((u) => [u.id, u]));
orders.map((order) => ({ ...order, user: userById.get(order.userId) }));
```

## 5. Leave alone

Unless a profile shows the line is hot, readable code SHOULD NOT be rewritten
for a gain the engine makes by itself:

- **Length** the agent SHOULD NOT cache `items.length` or a property read
  inside a loop.
- **Chains** the agent SHOULD NOT merge `.filter().map()` into one loop.
- **Loops** the agent SHOULD NOT swap `forEach` for a `for` loop.

## 6. In a review

- **Each finding** MUST give the rule, the line and the cost: "3 calls in a
  row, 1 round trip with `Promise.all`".
- **Speed claims** they SHOULD come with a number: round trips saved, KB off
  the bundle, the length of the list.
- **No real cost** a finding like a `find` over 10 items SHOULD shrink to a nit
  or be dropped.
