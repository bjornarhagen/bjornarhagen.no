---
title: UX tip for external links
author: Bjørnar Hagen
categories:
  - UX
  - Code
posterImage: /images/entries/2021/04/links/header.jpg
posterImageCredits: Photo by <a href="https://unsplash.com/@christopher__burns">Christopher Burns</a>
posterImageSize: sm
publishDate: 2021-04-28T20:08:47577Z
summary: Clicking links going to an external site can be annoying if you aren't prepared for that. To improve the user experience you should show some kind of indicator for external links.
body_id: post-page
body_classes: nav-small
---

Clicking on a link going to an external site can be annoying if you aren't prepared for that. To improve the user experience you should show some kind of indicator for external links.

On this website I have made such an indicator. The following link is an example:
<a href="//example.com" target="_blank" rel="noopener">Example link</a>.

If you are on desktop, when you hover the link it will show you an indicator. On mobile it should always show, although somewhat subtle to avoid beeing distracting.

The following code is how I implemented this indicator.

**HTML:**

```html
<a href="//example.com" target="_blank" rel="noopener">Example link</a>
```

**CSS:**

```css
a[target='_blank'] {
  position: relative;
}

a::after {
  content: '\\2197';
  position: absolute;
  top: -0.5em;
  right: -0.5em;
  opacity: 0.5;
}

/* Desktop */
@media (min-width: 60em) {
  a::after {
    opacity: 0;
  }

  a:focus::after,
  a:hover::after {
    opacity: 1;
  }
}
```

One drawback of my implementation is that it relies on target="\_blank". Which you may not always want to add. So an alternative way to set this up would be to use some JavaScript that finds all external links and adds a CSS class to the elements.

If you are willing to put down the effort, an even better example can be seen on web.mit.edu/contact. If you hover over the "Alumni Association" link, it will show you the domain of the external site in a tooltip. Unfortunately they have no indicator for mobile users.

That's it! Really short and sweet tip on how to improve the UX of your external links.
