Building an offline-first app taught me that working offline is the easy part. Syncing is the hard part. When I built FocusLoop, a single-user Pomodoro and habit tracker, I got offline mode working quickly. Most of my time went into deciding what should happen when the same record changed in two places.

## The easy 80%: making the app work offline

Getting an app to load and work without a network comes down to three ideas:

1. **Cache the app shell**, meaning the HTML, JS, CSS, and fonts, so the UI loads with no connection.
2. **Store data locally** in the browser.
3. **Read from local storage first**, and treat the network as a background update instead of something the UI waits on.

Once those are in place, the app feels fast online too, because most reads never touch the network.

### Service worker caching strategies

A service worker sits between your app and the network and decides where each request is answered from. I use different strategies for different kinds of requests:

- **Cache-first for the app shell.** Built assets have hashed filenames and never change, so serve them from the cache and only use the network when they're missing.
- **Network-first for API data.** Try the network so the data is fresh, and fall back to the cached response when offline.

```js
// sw.js
const SHELL_CACHE = "shell-v3";
const DATA_CACHE = "data-v1";
const SHELL_ASSETS = ["/", "/index.html", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL_ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== DATA_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
  } else if (request.mode === "navigate") {
    event.respondWith(caches.match("/index.html").then((r) => r || fetch(request)));
  } else {
    event.respondWith(caches.match(request).then((r) => r || fetch(request)));
  }
});

async function networkFirst(request) {
  const cache = await caches.open(DATA_CACHE);
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request)) ?? Response.error();
  }
}
```

In a real project I'd usually generate this with Workbox or `vite-plugin-pwa` rather than write it by hand. Writing it once by hand made the strategies click for me, though.

### IndexedDB for local data

`localStorage` is synchronous, string-only, and small, so it isn't suited to app data. IndexedDB is the right tool, and the `idb` library makes its API pleasant to use:

```js
import { openDB } from "idb";

export const dbPromise = openDB("focusloop", 1, {
  upgrade(db) {
    db.createObjectStore("sessions", { keyPath: "id" });
    db.createObjectStore("habits", { keyPath: "id" });
    db.createObjectStore("outbox", { keyPath: "seq", autoIncrement: true });
  },
});

export async function saveSession(session) {
  const db = await dbPromise;
  const record = { ...session, updatedAt: Date.now() };
  const tx = db.transaction(["sessions", "outbox"], "readwrite");
  await Promise.all([
    tx.objectStore("sessions").put(record),
    tx.objectStore("outbox").add({ type: "session", record }),
    tx.done,
  ]);
  return record;
}
```

Note that the write to `sessions` and the entry in `outbox` happen in **one transaction**. Either both are saved or neither is, so a change can never be stored locally and then forgotten by the sync process.

## The hard 20%: reconciling changes

Here's the problem. You edit a habit on your laptop while offline. Later you edit the same habit on your phone. Both devices eventually come online. Which version wins?

There are a few broad approaches:

- **Last-write-wins (LWW):** keep whichever change has the newest timestamp.
- **Field-level merging:** merge changes per field, so edits to different fields both survive.
- **Operational transforms or CRDTs:** data structures and algorithms that merge concurrent edits automatically, the way collaborative editors do.

### Why I chose last-write-wins for FocusLoop

FocusLoop is single-user. The realistic conflict is one person using two devices, and they rarely edit the same record at the same moment. When it does happen, the most recent edit is almost always the one they meant.

So I went with last-write-wins and added a small, visible **"synced"** indicator. The app shows whether there are pending changes in the outbox, so the user always knows whether a device is up to date. Making sync status visible prevented more confusion than a smarter merge algorithm would have.

### The sync queue

Each local change goes into the outbox with an `updatedAt` timestamp. A sync function sends changes in order and removes each one after the server confirms it:

```js
export async function flushOutbox() {
  const db = await dbPromise;
  const pending = await db.getAll("outbox");

  for (const item of pending) {
    const res = await fetch(`/api/${item.type}s/${item.record.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item.record),
    });
    if (!res.ok) break; // stop and retry later, keeping order
    await db.delete("outbox", item.seq);
  }
}

window.addEventListener("online", flushOutbox);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && navigator.onLine) flushOutbox();
});
```

On the server, last-write-wins comes down to one conditional update:

```sql
INSERT INTO habits (id, user_id, name, target, updated_at)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    target = EXCLUDED.target,
    updated_at = EXCLUDED.updated_at
WHERE habits.updated_at < EXCLUDED.updated_at;
```

If the incoming change is older than what's stored, the update is skipped. After syncing, the client pulls records changed since its last sync and overwrites local copies only where the server version is newer.

### Things I'd warn you about

- **The `online` event isn't proof of connectivity.** It means the device has a network, not that your server is reachable. Treat a failed request as "still offline" and retry later.
- **Device clocks are unreliable.** LWW with client timestamps depends on reasonably accurate clocks. For higher-stakes data, use a server-assigned version number or a hybrid logical clock instead.
- **Use client-generated IDs.** Create records with `crypto.randomUUID()` so they have stable IDs before they ever reach the server.
- **Background Sync isn't universal.** The Background Sync API can retry from the service worker after the tab closes, but browser support is limited, so I treat it as an extra, not the main mechanism.

## When I'd reach for CRDTs

If FocusLoop were a shared team board where several people edit the same list at once, last-write-wins would silently throw away people's work. That's where CRDTs earn their complexity. Libraries like Yjs and Automerge handle concurrent edits to text, lists, and maps, and merge them without a central authority deciding who wins.

The cost is real: more complex data models, larger payloads, and harder debugging. I'd only take that on when simultaneous editing is a core part of the product.

## The main lesson

**Match the sync strategy to how much simultaneous editing actually happens.** A single-user app can get by with last-write-wins and a clear sync indicator. A collaborative app needs real merging. Most apps are closer to the first case than people expect, and building CRDT-level sync for a personal tracker is effort that users won't notice.

## FAQ

### What is an offline-first app?

An offline-first app reads and writes to local storage first and syncs with a server in the background. It works fully without a connection, and the network is used to back up data and keep devices in sync, instead of being required for every action.

### Should I use IndexedDB or localStorage for offline data?

IndexedDB. It's asynchronous, stores structured data, supports transactions and indexes, and has far more storage space. `localStorage` is fine for small settings like a theme preference.

### How do offline apps handle sync conflicts?

The common approaches are last-write-wins based on timestamps or versions, merging changes field by field, or using CRDTs for automatic merging. The right one depends on how often the same record is edited in two places at the same time.

If you're planning an app that needs to work offline and want help choosing the right sync approach, take a look at [my services](/services) or [get in touch](/contact).
