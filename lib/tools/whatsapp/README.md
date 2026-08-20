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

## Reading it from other devices (OneDrive)

Backups always run on a machine with a browser. Only *reading* moves to the
cloud: after each run the archive is mirrored into a OneDrive **app folder**
and the deployed site reads it from there.

Scope is `Files.ReadWrite.AppFolder`, so consent covers one folder Microsoft
creates for this app and nothing else in the drive.

Setup (once):

1. portal.azure.com -> App registrations -> New registration, account type
   "personal Microsoft accounts".
2. Web redirect URIs:
   `http://localhost:3000/api/tools/whatsapp/onedrive/callback`
   and the same path on your live domain.
3. API permissions -> Graph -> Delegated -> `Files.ReadWrite.AppFolder`
   and `offline_access`.
4. Certificates & secrets -> New client secret.
5. `ONEDRIVE_CLIENT_ID` / `ONEDRIVE_CLIENT_SECRET` into `.env.local` (and your
   host's env), restart, then Settings -> OneDrive -> Link.

Refresh tokens rotate on every use, so they are written back to the same dual
store the site uses for settings: Upstash KV when configured (the only thing
that survives on a serverless host), a gitignored file otherwise.

Sync is a separate step, not part of the sweep: a network round-trip inside the
scroll loop would make backups slower and far more fragile. A manifest of
uploaded sizes/mtimes means re-syncing only sends what changed.

## Backing up in batches

A full sweep of every chat can run for hours, so the Backups tab can scan the
chat list first (seconds, no backup) and then take it N chats at a time, in a
chosen order, stopping and continuing whenever.

WhatsApp exposes **no size hint at all** before a chat is read, so sizes shown
are measured on disk after a chat has been archived once; unread chats show
"-". Sort by size only becomes useful after a first pass.

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
- **`#pane-side` contains rows that are not chats.** The "Archived" folder entry
  has no `span[title]`, so a per-row "first text span" fallback adopts it as a
  chat; opening it navigates into a sub-view, destroys the page context, and
  leaves every later chat genuinely absent -> a whole run of
  `not found in the chat list`. Pseudo-rows are filtered, the loose name
  fallback only applies when no row in the pane has a title, and the panel is
  reset to the plain list between chats.
- **Headless needs an explicit viewport.** With `viewport: null` a short window
  mounts fewer virtualised rows and chats at the end of the list get missed.
- In `next dev`, compiling a route on first use can kill the running browser
  mid-backup. It does not happen under `next start`.
