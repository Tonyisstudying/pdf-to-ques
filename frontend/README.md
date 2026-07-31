# Commonplace — frontend

Next.js (App Router, TypeScript) frontend for the personalized learning
platform. Two dashboards on top of the FastAPI backend in `../app`:

- **`/student`** — upload material, browse extracted concepts, generate and
  take quizzes inline, ask questions grounded in the uploaded document (RAG),
  see a concept map of that document.
- **`/educator`** — pick any uploaded document, see per-concept quiz
  accuracy in a table and on a concept map colored by mastery.

## Quickstart

```bash
npm install
cp .env.local.example .env.local   # points at the backend; edit if it's not on :8000
npm run dev
# http://localhost:3000
```

Run the backend alongside it (from the `../` project root):

```bash
uvicorn app.main:app --reload
```

The backend already has CORS enabled for `http://localhost:3000` — if you
deploy the frontend somewhere else, update `allow_origins` in
`../app/main.py`.

## Verified

`npm run build` completes cleanly (type-checked, all 4 routes statically
generated) — pinned to Next 14 / React 18 / Tailwind v3 specifically so this
is reproducible rather than dependent on whatever's newest on install day.

## Design notes

- **Palette**: warm paper (`--color-paper`) + ink (`--color-ink`) as the
  base, aged gold as the single accent, moss/clay for mastery-state
  feedback. Defined once as CSS variables in `app/globals.css`, consumed
  through Tailwind's `colors` theme extension in `tailwind.config.ts` — to
  change the palette, edit the variables, not individual components.
- **Type**: a book-serif stack for display text (`font-display`, used for
  headings/wordmark), system sans for body copy, mono for anything
  data-like. All system font stacks on purpose — no external font requests,
  so the build has no network dependency. Swap in `next/font/google` or
  self-hosted `.woff2` files later if you want a custom typeface.
- **Signature element**: `components/ConceptMap.tsx` — a radial layout of a
  document's concepts with edges drawn from the `prerequisites` data the
  backend already extracts, colored by quiz accuracy on the educator side.
  It's a literal visualization of the "second brain" idea the whole product
  is built around, not a generic chart.

## What's stubbed / not wired up yet

- **Auth**: every action is attributed to `demo-student` — there's no login.
  Layer 2 (auth + real-time chat) wasn't built yet; wiring real accounts in
  means threading a user id through `lib/api.ts` and the dashboards instead
  of the hardcoded default.
- **Chat isn't streaming**: `ChatPanel` does a plain `fetch` and waits for
  the full answer. SSE/WebSocket streaming is a Layer 2 change on the
  backend (`/chat/ask` would need to become a streaming endpoint) plus a
  `ReadableStream` reader here.
- **The Obsidian plugin/API endpoint** mentioned alongside this layer wasn't
  built in this pass — happy to do that next.
