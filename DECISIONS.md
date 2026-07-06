# Decisions

## RTK approach

The app uses Redux Toolkit because the task console needs a predictable state model for pagination, filters, live updates, cache status, and selection. The slice is small and explicit, and the selectors keep UI components free from state shape details.

## Why createEntityAdapter was used

createEntityAdapter gives normalized entity storage with simple upsert and set operations. It makes task merges and selection logic easier to reason about and avoids hand-rolled entity bookkeeping.

## Normalization strategy

Backend payloads are normalized into a strict internal model. Unknown or messy values are converted to safe defaults instead of crashing the UI. The raw values are preserved on the normalized objects when useful so the display can surface unexpected types and statuses without losing the original signal.

## Unknown values

Unexpected task types and statuses are preserved as unknown and rendered explicitly. The UI keeps them visible rather than dropping them, which makes debugging and review easier.

## WebSocket merge strategy

Websocket updates are merged into the existing task entities when the task is already loaded. If the task is still unloaded, the task id is tracked in a pending-event reference list so the app can avoid crashes and keep the update visible in a lightweight way.

## Reconnect approach

The websocket hook reconnects with capped backoff and updates the connection badge to indicate the current state. It also cleans up the socket safely on unmount.

## Markdown streaming approach

The summary panel fetches the task summary endpoint and reads the stream incrementally. Chunks are appended as they arrive so the UI feels live while still remaining safe.

## Sanitization path

Sanitization occurs in the summary renderer through the rehype-sanitize plugin on the React Markdown component. No dangerouslySetInnerHTML is used.

## IndexedDB caching approach

The app hydrates from localforage on start, displays cached data immediately, and then revalidates with a fresh fetch. This keeps the UI responsive while making the data feel current after the network finishes.

## Stale data handling

Cached data is marked as stale in the UI and replaced once fresh data is loaded. The app does not block the main thread on writes and keeps the cache operation asynchronous.

## Edge cases handled

- Missing or malformed task fields fall back to safe defaults.
- Invalid websocket payloads are ignored without crashing the app.
- Stream errors are surfaced in the UI.
- Empty, loading, error, and stale states are all represented.

## Deliberately not implemented

- Full SSE protocol framing, auth flows, and server-side persistence were not added because the assessment scope is a focused frontend console.
- The websocket and summary streams are intentionally simple to keep the implementation interview-friendly.

## What would improve with more time

- A more sophisticated event backlog for unloaded tasks.
- Cache invalidation and background refresh policies.
- Better pagination and query caching behavior.

## AI usage and verification

The implementation was built with AI assistance, then verified by running the test suite and checking the TypeScript build flow. The content in this document is kept honest and reflects the implemented behavior.

## Bug hunt explanations

The original TaskTicker component had several defects:

- The interval used stale state because it incremented the tick value from the captured value rather than the functional updater already present in the fixed version.
- The fetch effect could run with a null selected task id.
- The effect omitted apiBase from its dependency list, which could leave stale URLs in play.
- Selection changes could race with old requests because there was no abort controller and no cleanup around the previous request.
- State updates were mutating the previous array by pushing into it.
- Sorting mutated the array directly and could create side effects.
- A list index was used as the key, which is unstable for reordering.
- The component did not check response.ok, so non-2xx responses were treated as successful JSON.
- Duplicate tasks could appear because updates were appended without deduplication.
