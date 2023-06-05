---
title: Hvordan legge til linjenummer i pre-tagger
author: Bjørnar Hagen
categories:
  - UX
  - Code
posterImage: /images/entries/2021/05/pre-line-numbers/header.jpg
posterImageCredits: 'Bilde av [Adi Goldstein](https://unsplash.com/@adigold1)'
posterImageSize: sm
publishDate: 2021-05-06T14:25:01.751Z
summary: Å lese kode er enklere når du har linjenummer, men hvordan kan du vise linjenummer i en <pre> tag? Dette kan enkelt løses med noen få linjer JS og CSS, ingen behov for et stort eksternt bibliotek.
---

Å lese kode er enklere når du har linjenummer, men hvordan kan du vise linjenummer i en `<pre>` tag? Dette kan enkelt løses med noen få linjer JS og CSS, ingen behov for et stort eksternt bibliotek.

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

Syntax highlighting is much more complicated to solve, but maybe I'll make a post about it one day. For now my `<pre>` tags remain black and white.
