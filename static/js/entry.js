; (function () {
  const path = window.location.pathname
  const splitPath = path.split('/entries/')

  if (splitPath.length === 2) {
    tryToFindPost(splitPath[1])
      .then((r) => {
        const entry = { ...r }
        entry.content = []
        r.content.forEach((contentItem) => {
          contentItem.text = marked(contentItem.text)
          entry.content.push(contentItem)
        })

        if (entry.posterImage) {
          const image = new Image()
          image.src = entry.posterImage
          image.addEventListener('load', () => {
            updateEntry({ ...entry, posterImage: image.src })
          })

          const loadingImageTheme = window.theme === 'dark' ? 'light' : 'dark'
          entry.posterImage = '/images/loading-' + loadingImageTheme + '.svg'
        }

        updateEntry(entry)
      })
      .catch((e) => {
        _404()
      })
  }
})()

function tryToFindPost(path) {
  return new Promise((resolve, reject) => {
    fetch('/entries/' + path + '.json')
      .then((r) => r.json())
      .then((r) => {
        resolve(r)
      })
      .catch((e) => reject(e))
  })
}

function _404() {
  const entry = {
    title: '404 — Not found',
    posterImage: '/entries/index.jpg',
  }
  updateEntry(entry)
}

function updateEntry(entry) {
  const event = new CustomEvent('entry-load', {
    detail: {
      entry,
    },
  })
  window.dispatchEvent(event)

  try {
    updateSEO(entry)

    setTimeout(() => {
      // addLineNumbersToPres()
      addTargetBlankToExternalLinks()
    }, 10)
  } catch (error) {
    console.error(error)
  }
}

function addLineNumbersToPres() {
  const pres = document.querySelectorAll('pre')
  pres.forEach((pre) => {
    if (!pre.hasLineNumbers) {
      pre.hasLineNumbers = true
      const lineNumberWrapper = document.createElement('span')
      lineNumberWrapper.classList.add('pre-line-numbers')

      const preLines = pre.textContent.split('\n').length

      for (let i = 0; i < preLines - 1; i++) {
        const span = document.createElement('span')
        span.appendChild(document.createTextNode(i))
        lineNumberWrapper.appendChild(span)
      }

      pre.insertBefore(lineNumberWrapper, pre.firstChild)
    }
  })
}

// Add target="_blank" and rel="noopener" to external links
function addTargetBlankToExternalLinks() {
  let internalDomain = location.host.replace('www.', '')
  internalDomain = new RegExp(internalDomain, 'i')

  const links = document.getElementsByTagName('a')
  for (let i = 0; i < links.length; i++) {
    const link = links[i]

    if (!internalDomain.test(link.host)) {
      link.setAttribute('target', '_blank')
      link.setAttribute('rel', 'noopener')
    }
  }
}

function updateSEO(entry) {
  // Title
  const titleElement = document.querySelector('head title')
  if (titleElement.innerHTML.indexOf(entry.title) === -1) {
    titleElement.innerHTML = titleElement.innerHTML.replace('Post | ', entry.title + ' | ')
  }

  // Open Graph title
  const metaTitle = document.querySelector('head meta[property="og:title"]')
  if (metaTitle.getAttribute('content').indexOf(entry.title) === -1) {
    metaTitle.setAttribute('content', metaTitle.getAttribute('content').replace('Post | ', entry.title + ' | '))
  }

  // Meta description and Open Graph description
  const metaDescriptions = [
    document.querySelector('head meta[name="description"]'),
    document.querySelector('head meta[property="og:description"]'),
  ]
  metaDescriptions.forEach((metaDescription) => metaDescription.setAttribute('content', entry.summary))

  // Open Graph image
  const metaImage = document.querySelector('head meta[property="og:image"]')
  metaImage.setAttribute('content', entry.posterImage)

  // Open Graph type
  const metaType = document.querySelector('head meta[property="og:type"]')
  metaType.setAttribute('content', 'article')

  // Open Graph URL
  const metaUrl = document.querySelector('head meta[property="og:url"]')
  if (metaUrl.getAttribute('content').indexOf(window.location.pathname) === -1) {
    metaUrl.setAttribute('content', metaUrl.getAttribute('content') + window.location.pathname)
  }

  // Open Graph URL
  const linkCanonical = document.querySelector('head link[rel="canonical"]')
  if (linkCanonical.getAttribute('href').indexOf(window.location.pathname) === -1) {
    linkCanonical.setAttribute('href', linkCanonical.getAttribute('href') + window.location.pathname)
  }
}
