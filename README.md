# Annotation Activity Console

A compact Next.js dashboard for browsing normalized annotation tasks, filtering and sorting them, streaming AI summaries, and observing live websocket-driven updates.

## Project overview

This project is a take-home assessment implementation focused on frontend data handling rather than visual polish. It uses typed normalization, Redux Toolkit entity state, IndexedDB caching, WebSocket updates, streamed markdown summaries, and Jest/React Testing Library coverage.

## Run the mock server

```bash
cd mock-server
npm install
npm run mock
```

## Run the frontend

```bash
npm install
npm run dev
```

The frontend runs on the default Next.js dev URL, usually `http://localhost:3000`.

## Run tests

```bash
npm test
```

## Build

```bash
npm run build
```

## Environment variables

```env
NEXT_PUBLIC_API_BASE=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000/ws
```

## Architecture summary

- Next.js App Router with Redux Toolkit state and typed selectors.
- Strong normalization for messy backend payloads and safe unknown handling.
- Local IndexedDB caching via localforage for stale-while-revalidate behavior.
- SSE-style summary streaming with react-markdown and rehype-sanitize.
- Jest + Testing Library for normalization, selectors, and component behavior.

## Security note

Markdown summaries are rendered only through React Markdown with a sanitize rehype pipeline. Raw HTML is never injected with dangerouslySetInnerHTML.

## Known tradeoffs

- The dashboard focuses on one page of task data and keeps the UX simple.
- Websocket events are merged into the current entity state and queued for unloaded tasks rather than creating a large event system.
- Summary streaming is intentionally lightweight and does not implement full SSE framing semantics.
