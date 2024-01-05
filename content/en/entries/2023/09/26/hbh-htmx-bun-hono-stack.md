---
title: HBH Stack
author: Bjørnar Hagen
categories:
  - Code
posterImage: /entries/2023/07/17/header.png
posterImageCredits: null
posterImageSize: sm
publishDate: 2023-09-26T11:15:00.000Z
summary: HBH stack
body_id: post-page
body_classes: nav-small
---

## Preface

The release of Bun 1.0 blew everyones collective mind, at least those in the JS world. It solved similar problems as Deno, but without breaking NodeJS compatability, which is a major deal. Out of the box it comes with support for Typescript, JSX, a fast web server, package manager, better filesystem API, and more.

After seing Bun's performance blowing NodeJS out of the water, and even getting somewhat close to that of Go and Rust, I had to give it a try for myself to see what all the fuzz was about.

## Birth of the HBH stack

First I had to find a project to try out Bun with. I've been meaning to re-build my agency's website for a while now, that's a suitable test bed.

Lately I've also been getting into HTMX, and have experimted with using SSR with templating engines like Twig and Blade (PHP). I've really enjoyed the developer experience this enables. I feel that HTMX solves the critical issue of state management if you follow [HATEOAS](https://htmx.org/essays/hateoas/). This is a great productivity boost, as you no longer have to write your state twice.

So I figured it would be interesting to use Bun together with HTMX, but before starting I needed the last piece of the puzzle; a framework to help out with things like routing, structure, templating, caching, etc.
I went searching online for what other people had done and found solutions like: "[Hono + htmx + Cloudflare is a new stack](https://blog.yusu.ke/hono-htmx-cloudflare/)", "[Example todo app with the html.js framework](https://github.com/dctanner/htmljs-todo-example)", and "[The BETH stack](https://github.com/ethanniser/the-beth-stack)". While these were nice, they didn't really have the setup I was looking for and fell short in different ways.

I want a setup that

- Follows the MVC pattern
- Has good SEO support
- Is intuitive and simple
- Makes it easy to follow the [12 factor app](https://12factor.net/) principles

I went searching for a framework with support for Bun. The best option I could find was [Hono](https://hono.dev/).

There we have it, the **HBH stack**:

- HTMX
- Bun
- Hono
