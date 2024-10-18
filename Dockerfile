FROM oven/bun:latest AS build
ENV NODE_ENV=production
WORKDIR /app
COPY . .
RUN bun install
RUN bun run build

FROM oven/bun:latest AS deploy
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080
WORKDIR /app
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
EXPOSE 8080
CMD ["bun", "dist/server/entry.mjs"]
