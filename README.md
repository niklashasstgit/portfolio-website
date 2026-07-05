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
