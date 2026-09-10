# Base image is pinned rather than :latest so a rebuild of the same commit
# produces the same image. Alpine bun ships a non-root `bun` user at uid 1000,
# which the cluster's restricted Pod Security Admission requires.
FROM oven/bun:1.2-alpine AS build

# Selects the standalone Node adapter in astro.config.ts. Without it the build
# emits Vercel output and the entrypoint below will not exist.
ENV BUILD_TARGET=container

WORKDIR /app

# Dependencies are installed before the source is copied so this layer is
# reused whenever only application code changes.
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .
# The build script sets NODE_ENV=production itself. It is deliberately not set
# earlier, so that devDependencies needed by `astro check` are installed.
RUN bun run build

FROM oven/bun:1.2-alpine AS deploy

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080

WORKDIR /app

# The Astro node adapter does not bundle dependencies, so node_modules is
# required at runtime.
COPY --from=build --chown=bun:bun /app/node_modules /app/node_modules
COPY --from=build --chown=bun:bun /app/dist /app/dist

USER bun
EXPOSE 8080

CMD ["bun", "dist/server/entry.mjs"]
