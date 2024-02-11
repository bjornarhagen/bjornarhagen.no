---
title: You are using Docker wrong
author: Bjørnar Hagen
categories:
  - Code
  - DevOps
posterImage: /entries/2024/02/10/you-are-using-docker-wrong.jpg
posterImageCredits: null
posterImageSize: null
publishDate: 2024-02-10T23:55:00.000Z
summary: I see many developers using Docker wrong. They still run everything locally, and only use Docker in the CI/CD pipeline. While this has it's benefits, there's still a lot of potential being missed.
body_id: post-page
body_classes: nav-small
---

It goes without saying that the title is a bit of a hyperbole, but I do see a lot of developers using Docker in a bit of a strange way. There's a Dockerfile/Docker compose file present, but the developers never use it. They run everything 100% locally on the machine, the Dockerfile is just used in the CI/CD pipeline. I think this misses a large point of Docker, let's get into it.

## Preqrequisites

Docker or Podman.

## Why use Docker?

An infamous phrase in software development you've probably heard before:

> "It works on my machine."

While it's often used as a joke, this issue is probably more often a real one, stealing unnecessary time and causing headaches. Docker was supposed to solve this problem by making it work on your machine, then shipping your machine to the server/other developers, figuratively of course (<a href="https://twitter.com/dhh/status/1755600973492564067" target="_blank">or maybe literally?</a>). However, if you don't use Docker locally, you're not shipping your guaranteed-to-work machine, you're still doing things the _"old way"_, but with extra complexity mixed in.

## How to use _properly_ use Docker

There are many ways to do this, but here's my preferred way:

1. Create a folder in your project called `docker`.
2. In this folder, create a `Dockerfile.local` and a `docker-compose.local.yml`.
3. In the `Dockerfile.local`, include the main dependencies like Node:20 or Python:3.8.
4. In the `docker-compose.yml`, include the services you need, like a database, a backend, and a frontend. Then crucially, include a `volumes` section to mount your code into the container.
5. Now, when you want to run your app, you just run `docker-compose -f docker-compose.local.yml up -d` in the `docker` folder, and you should have a running container.
6. You can now connect to the container, and install your dependencies, run your tests, and start your app.

With this setup you no longer need to use tools like `nvm`, `pyenv`, `jenv`, etc. No more need to _pollute_ your machine with 5 versions of Node, 3 versions of Python, and 2 versions of Java. The only dependency you need is Docker. This has several benefits; you can easily switch between projects without having to worry about different versions of dependencies, you can easily onboard new developers, and you can easily run your app in CI/CD for more than just production builds.

## Example setup

/docker/Dockerfile.local:

```Dockerfile
FROM node:20-alpine
WORKDIR /app
EXPOSE 3000
CMD ["sh"]
```

Notice how we don't copy over any files, we'll mount the code as a volume instead.

/docker/docker-compose.local.yml:

```yaml
version: '3.1'

services:
  name-of-your-service:
    build:
      context: .
      dockerfile: Dockerfile.local
    ports:
      - '3000:3000'
    volumes:
      - ../:/app # Mount the code into the container
    tty: true
```

With this `volume` setup, your whole project becomes available inside the container. Any change you do on your local machine is immediately reflected in the container.

**Bonus:** If you're using VSCode, you can add a `.vscode/launch.json` file to easily launch your application without typing commands in the terminal. Only tested on Linux and MacOS, you might need to get Git Bash for Windows.

```json
{
  "configurations": [
    {
      "name": "Docker - start container",
      "command": "docker compose -f ${workspaceFolder}/docker/docker-compose.local.yml up -d",
      "request": "launch",
      "type": "node-terminal"
    },
    {
      "name": "Docker - Connect to container",
      "command": "docker exec -it $(docker ps | grep 'name-of-your-service' | awk '{print $1}') sh -c 'if [ -x /bin/bash ]; then exec /bin/bash; else exec /bin/sh; fi'",
      "request": "launch",
      "type": "node-terminal"
    }
  ]
}
```

## End notes

Docker is a very powerful tool, and hopefully this article has shown you how to use it more effectively for your local development environment. If you have any questions or feedback, feel free to reach out to me on [X](https://x.com/bjornarhagen).
