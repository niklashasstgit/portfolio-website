# WhatsApp Archive tool

Local-only tool under `/tools/whatsapp`. It reads your own WhatsApp Web chats
and keeps them in an **append-only archive** outside this repo.

## Why it only runs locally

It drives a real Chrome (via `playwright-core`) and writes to a real disk.
Neither exists on a serverless host, so `lib/tools/whatsapp/settings.ts`
(`isLocalRuntime`) disables the whole tool in production and the API returns
`503 { code: "not-local" }`. Set `WHATSAPP_TOOL_ENABLED=1` only if you ever run
`next start` on your own machine.

## Where the data lives

Default `%OneDrive%/WhatsApp Archive` (changeable in the tool's Settings tab):

```
archive.json              index: chat + version summaries
chats/<Chat name>/
  chat.json               full append-only transcript
  chat.txt                WhatsApp-export shaped text
  chat.html               standalone offline viewer — opens on a phone
  media/                  captured thumbnails
versions/<id>.json        one manifest per backup run
```

Nothing here is ever deleted. A chat you delete on your phone stops being
re-seen and is flagged `presentInLatest: false` — it stays readable forever.

## Full vs partial

Both write into the same vault; only the sweep depth differs.

- **Full** — every chat, swept to the very beginning.
- **Partial** — stops once it meets messages already archived
  (`partialStopAfterKnown`). Measured on the test fixture: 231 s full vs 13 s
  partial for the same chat, with nothing lost.

Each message carries `firstSeen` / `lastSeen` version stamps, so
`?version=<id>` on the chat API rewinds the archive to how it stood after any
earlier run without storing a second copy.

## Testing without a real account

`test/fixtures/mock-whatsapp.html` reproduces the two hard parts of WhatsApp
Web — virtualised lists and lazily loaded history. Point the driver at it:

```bash
WHATSAPP_TOOL_START_URL="file:///<abs-path>/test/fixtures/mock-whatsapp.html" npm run dev
```

## Gotchas worth remembering

- **A layout does not protect its children.** `/tools/layout.tsx` renders the
  PIN form, but the page underneath still runs and its props are serialised
  into the RSC payload. Every server component under `/tools` must call
  `isToolsAuthed()` itself — this leaked settings paths until it did.
- **Clear the search box before enumerating chats.** Leftover text filters the
  list and a backup silently skips everything that does not match.
- **Headless needs an explicit viewport.** With `viewport: null` a short window
  mounts fewer virtualised rows and chats at the end of the list get missed.
- In `next dev`, compiling a route on first use can kill the running browser
  mid-backup. It does not happen under `next start`.
