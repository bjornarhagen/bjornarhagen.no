---
title: How to add line numbers to pre tags
description: Adding line numbers to pre tags can be a nice touch to your code snippets. In this post I will show you how to do it with just a few lines of CSS and JavaScript.
author: Bjørnar Hagen
categories:
  - UX
  - Code
posterImage: /entries/2021/05/06/header.jpg
posterImageCredits: 'Photo by <a href="https://unsplash.com/@adigold1">Adi Goldstein</a>'
posterImageSize: sm
publishDate: 2021-05-06T14:25:01.751Z
summary: Reading code is easier when you have line numbers, but how can you show line numbers in a <pre> tag? This can easily be solved with a few lines of JS and CSS, no need for a big external library.
body_id: post-page
body_classes: nav-small
---

Reading code is easier when you have line numbers, but how can you show line numbers in a `<pre>` tag?
This can easily be solved with a few lines of JS and CSS, no need for a big external library.

**JS:**

```js
function addLineNumbersToPres() {
  const pres = document.querySelectorAll('pre')
  pres.forEach((pre) => {
    const lineNumberWrapper = document.createElement('span')
    lineNumberWrapper.classList.add('pre-line-numbers')

    const preLines = pre.textContent.split('\\n').length
    for (let i = 0; i < preLines - 1; i++) {
      const span = document.createElement('span')
      span.appendChild(document.createTextNode(i))
      lineNumberWrapper.appendChild(span)
    }

    pre.insertBefore(lineNumberWrapper, pre.firstChild)
  })
}
```

This changes the HTML for the `<pre>` tag to look something like this:

```html
<pre>
  <span class="pre-line-numbers">
    <span>0</span>
    <span>1</span>
    <span>2</span>
    <span>3</span>
    <span>4</span>
    <span>5</span>
  </span>
  <code>
    // Code comes here
  </code>
<pre>
```

Now for the styling.

**CSS:**

```css
pre {
  position: relative;
  width: 100%;
  overflow: auto;
  display: grid;
  grid-template-columns: min-content max-content;
}

pre .pre-line-numbers {
  display: flex;
  flex-direction: column;
  height: 100%;
  text-align: right;
  user-select: none;
}
```

**Extra:**
According to caniuse.com user-select without prefixes is only supported by 50-70% of browsers at the time of writing, so here's the prefixed properties if you want to add them:

```css
pre .pre-line-numbers {
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
```

## What about syntax highlighting?

Syntax highlighting is much more complicated to solve, but maybe I'll make a post about it one day. ~~For now my `<pre>` tags remain black and white.~~

**Update:** I've added syntax highlighting to my page, it's setup via Hugo.
