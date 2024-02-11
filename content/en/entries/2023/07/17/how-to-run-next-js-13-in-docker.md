---
title: How to run Next.js 13 in Docker
author: Bjørnar Hagen
categories:
  - Code
  - DevOps
posterImage: /entries/2023/07/17/header.png
posterImageCredits: null
posterImageSize: sm
publishDate: 2023-07-17T11:15:00.000Z
summary: How to setup development and production container images for Next.js 13 with app router and standalone mode.
body_id: post-page
body_classes: nav-small
---

I recently had to setup a Next.js 13 project with Docker, and I had some trouble finding a good solution. After a bit of work I have a good working solution and thought I'd share it.

The Dockerfiles are based on [an example](https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile) I found from the Next.js team. It didn't work out of-the-box for me, due to some issues with standalone mode and the new app dir feature as well as some incorrect permissions, so I had to make some changes.

The container images should run fine on both Docker and Podman.

## Development container

<mark class="subtle">**Update 2024-02-10**: I've learnt quite a bit about Docker since I wrote this post and have made a dedicated post on [how to best use Docker for local development](/entries/2024/02/10/you-are-using-docker-wrong)</mark>

First of I want to run the project locally inside of Docker, that way I don't have to deal with installing all the different dependencies on my machine.

Dockerfile.local:

```Dockerfile
FROM node:18-alpine AS base

FROM base AS deps
# https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn; \
  elif [ -f package-lock.json ]; then npm install; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM base AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
ENV NODE_ENV development
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
EXPOSE 3000
CMD ["bash"]
```

One thing I like to do with local development images is to mount the source code as a volume inside the container, so that changes to the source code are reflected live in the running container. To acheive this I use a script that builds and runs the Dockerfile.local.

run.sh:

```shell
#!/bin/bash

IMAGE_NAME="your-image-name-here"
TAG_NAME="latest"
CONTAINER_INSTANCE_NAME="instance-name-here"
COMMAND_TO_RUN_ON_CONTAINER="yarn dev"

command_exists() {
    type "$1" &>/dev/null
}

if command_exists podman; then
    CONTAINER_TOOL=podman
elif command_exists docker; then
    CONTAINER_TOOL=docker
else
    echo "Could not find podman or docker. Please install one of them and try again."
    exit 1
fi

echo "Using $CONTAINER_TOOL: $(command -v $CONTAINER_TOOL)"
$CONTAINER_TOOL build --pull --rm -f "Dockerfile.local" -t $IMAGE_NAME:$TAG_NAME "."
$CONTAINER_TOOL run --rm -it -v $(pwd):/app -p 3000:3000 --name instance-name-here $IMAGE_NAME:$TAG_NAME $COMMAND_TO_RUN_ON_CONTAINER
```

This script builds and runs the Dockerfile.local.
It uses Podman if available, otherwise falls back to Docker.
`./` is mounted as a volume on `/app` inside the container, so that changes to the source code are reflected live in the container.

Running this your application should be available on [http://localhost:3000/](http://localhost:3000/).

You can use the instance name to connect to the container, like so:

```shell
docker exec -it instance-name-here /bin/sh
```

When connected you can run commands with npm/yarn/pnpm, this is great when you want to install new dependencies.

## Production container

With the local development environment out of the way, let's setup a production ready image.

First I want to use [standalone mode](https://nextjs.org/docs/pages/api-reference/next-config-js/output#automatically-copying-traced-files).
This allows us to run the built app without having to copy all of node_modules into the image, greatly reducing the size of the image.

next.config.js:

```javascript
const nextConfig = {
  output: 'standalone',
}

module.exports = nextConfig
```

Dockerfile:

```Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN yarn lint
RUN yarn build

# Production image, copy all the files and run node
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
RUN chown node:node .
COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

The only thing I don't like about this is that the .env is made part of the image. I think that's somewhat of a security risk.
I prefer to inject the .env at runtime, but Next.js needs it at build time, so I haven't found a good solution for this yet.
