# bjornarhagen.no

Personal site for Bjørnar Hagen. Astro 5 (server output) + Bun runtime + Tailwind v4, deployed to Vercel.

## Development is Docker-only

No local tooling is installed on the host. All commands (dev server, build, install, etc.) run inside the Docker container.

-   Container name: `bjornarhagen-no`
-   Run commands via: `docker exec bjornarhagen-no <command>`
-   Compose file: `.devcontainer/docker-compose.local.yml`
-   Working directory inside the container: `/app`
-   Runtime: Bun

Inside the container (correct):

```bash
docker exec bjornarhagen-no bun run dev
docker exec bjornarhagen-no bun run build
docker exec bjornarhagen-no bun install
docker exec bjornarhagen-no bun add <pkg>
```

On the host (will fail — no tooling installed):

```bash
bun run dev
bun install
```

If the container isn't running, bring it up first:

```bash
docker compose -f .devcontainer/docker-compose.local.yml up -d
```

## Tech stack

-   **Astro 5** with `output: "server"` and the Vercel adapter (`astro.config.ts`)
-   **Bun** is the runtime and package manager — `bun.lockb` is the lockfile of record
-   **Tailwind v4** via `@tailwindcss/vite`, still using a v3-style `tailwind.config.mjs` (imported via the `@config` directive in `src/styles/global.css` and `src/components/dumb/ContentRenderer.css`)
-   **TypeScript** with path aliases (`tsconfig.json`):

    -   `@/*` → `src/*`
    -   `~/*` → `public/*`

    Prefer aliased imports over relative ones — write `@/utils/misc`, not `../../utils/misc`.

## Checks

-   Type check + build: `docker exec bjornarhagen-no bun run build` (runs `astro check` first)
-   Formatting: Prettier (`.prettierrc` — 4-space indentation, no tabs). **No ESLint configured.**

## Layout

-   `src/pages/` — Astro routes (file-based)
-   `src/components/dumb/` — presentational components
-   `src/components/smart/` — components that own/fetch data
-   `src/layouts/`, `src/styles/`, `src/utils/`
-   `src/data/` — JSON-backed content (see below)
-   `public/` — static assets, including post images under `public/images/entries/<year>/<slug>.<ext>`

## Content model — posts and portfolio

Posts and portfolio entries live in JSON, not as Markdown files:

-   `src/data/entries.json` — blog posts ("entries")
-   `src/data/portfolio.json` — portfolio items
-   Shape (see `src/data/dynamic-pages.ts`): `{ [year]: { [slug]: PageContent } }`
-   `PageContent` fields: `title`, `date` (ISO), `slug`, `summary`, `poster`, `imageHeader`, optional `imageText`, and `content` — an array of `ContentSection` blocks rendered by `src/components/dumb/ContentRenderer.astro`.

To add a new post:

1. Add an object under `src/data/entries.json` keyed by year then slug.
2. Drop the header/poster image at `public/images/entries/<year>/<slug>.{jpg,webp,png}`.
3. The route `src/pages/[dynamicPageType]/[year]/index.astro` picks it up automatically — no other registration needed.
