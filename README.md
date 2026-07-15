# niklasblattner.com — Portfolio

Personal engineering portfolio built with Next.js (App Router), Tailwind CSS 4, GSAP, and react-three-fiber.

## Development

```bash
npm run dev
```

On this machine, use `dev-server.cmd` instead (fixes the Node PATH before running `npm run dev`).

Open [http://localhost:3000](http://localhost:3000).

## Structure

- `app/` — routes; each flagship project has its own page under `app/projects/`, lighter CV projects render through `app/projects/[slug]`
- `content/` — all project text/media definitions (`projects-index.ts` is the master list)
- `components/` — scrollstory system, diagrams, three.js sim viewer, nav/footer
- `public/images/` — one folder per project

## Admin console (`/admin`)

A password-gated console at [`/admin`](http://localhost:3000/admin) for:

- **Projects** — show/hide any project and re-file it into a different category /
  subcategory. Changes publish to every visitor immediately (they layer on top of
  the static catalog in `content/projects-index.ts`; the originals are untouched).
- **Analytics** — every public page view is recorded with the visitor's IP,
  location, and **network-owner company** (the ASN organization — which identifies
  corporate visitors; home/mobile IPs show only their ISP and aren't attributed).
  Three ways to filter out your own traffic, all applied at display time: the
  **Devices** panel (a persistent per-browser id — the reliable way, survives
  mobile↔WiFi and daily ISP IP rotation, and tells apart devices on one WiFi),
  the **Visitors by IP** panel (name/exclude an exact IP, or exclude its whole
  **/24** block), and IP-prefix exclusion for rotating home addresses. Geolocation
  is ISP-level (town accuracy isn't possible for consumer IPs); the real value is
  the **company** signal for corporate visitors.

Auth is a PIN in `ADMIN_PIN` → a signed, httpOnly session cookie. Overrides + events
persist in Upstash Redis (KV) in production, or `.data/*.json` locally (gitignored).

### Environment variables

| Variable                | Required | Purpose                                                                                  |
| ----------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `ADMIN_PIN`             | **yes**  | The PIN entered at `/admin`. Without it, admin login is disabled.                        |
| `ADMIN_SESSION_SECRET`  | no       | Secret used to sign the admin session cookie. Defaults to `ADMIN_PIN`.                   |
| `IPINFO_TOKEN`          | no       | If set, uses [ipinfo.io](https://ipinfo.io) for IP → company/location (HTTPS, cleaner data). Otherwise falls back to the free, no-signup [ip-api.com](https://ip-api.com). |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | prod | Upstash Redis (also aliased `UPSTASH_REDIS_REST_*`). Powers settings + analytics storage in production; without them the local `.data/` file store is used. |

Locally, set `ADMIN_PIN` in `.env.local` (already gitignored). In production, set it
in the Vercel project settings. Note: storing visitor IPs + locations is personal data
under GDPR — retention/compliance is the site owner's responsibility.
