;(function () {
  try {
    tryToFindJsonFile('/entries/index.json').then((r) => {
      updateEntries(r.entries)

      const entries = []
      r.entries.forEach((entry, i) => {
        tryToFindJsonFile('/entries/' + entry.path + '.json').then((entryData) => {
          entry.data = entryData
          if (!entry.data.summary) {
            try {
              const text = entry.data.content[0].text
              entry.data.summary = text.substr(0, 200).trim()

              if (text.length > 200) {
                entry.data.summary += '...'
              }
            } catch (e) {}
          }
          entries[i] = entry
        })
      })

      let interval = setInterval(() => {
        if (entries.length === r.entries.length) {
          updateEntries(entries)
          clearInterval(interval)
          interval = null
        }
      }, 100)
      setTimeout(() => {
        if (interval) {
          clearInterval(interval)
          showError()
        }
      }, 1000)
    })
  } catch (error) {
    console.error(error)
    showError()
  }
})()

function tryToFindJsonFile(path) {
  return new Promise((resolve, reject) => {
    fetch(path)
      .then((r) => r.json())
      .then((r) => {
        resolve(r)
      })
      .catch((e) => reject(e))
  })
}

function showError() {
  const entries = [
    {
      data: {
        title: 'Something went wrong',
        categories: [],
        content: [{ text: 'Posts could not be loaded. Please try again later.' }],
      },
    },
  ]

  updateEntries(entries)
}

function updateEntries(entries) {
  window.dispatchEvent(
    new CustomEvent('entries-load', {
      detail: {
        entries,
      },
    })
  )
}
