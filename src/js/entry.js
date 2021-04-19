;(function () {
  const path = window.location.pathname
  const splitPath = path.split('/entries/')

  if (splitPath.length === 2) {
    tryToFindPost(splitPath[1])
      .then((r) => {
        console.log(r)

        const entry = {}
        entry.title = 'Hello wold :)'
        entry.poster = '/entries/index.jpg'

        updateEntry(entry)
        setTimeout(() => updateEntry(entry), 100)
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
    poster: '/entries/index.jpg',
  }
  updateEntry(entry)
  setTimeout(() => updateEntry(entry), 100)
}

function updateEntry(entry) {
  const event = new CustomEvent('entry-load', {
    detail: {
      entry,
    },
  })
  window.dispatchEvent(event)
}
