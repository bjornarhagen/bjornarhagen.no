const getDayTimeName = (currentTime = new Date()) => {
  const currentHour = currentTime.getHours()
  const splitAfternoon = 12 // 24hr time to split the afternoon
  const splitEvening = 18 // 24hr time to split the evening

  if (currentHour >= splitAfternoon && currentHour < splitEvening) {
    // Between 12 PM and 5PM
    return 'afternoon'
  } else if (currentHour >= splitEvening) {
    // Between 5PM and Midnight
    return 'evening'
  }
  // Between dawn and noon
  return 'morning'
}

function setupTheme() {
  const dayTimeName = getDayTimeName()
  if (dayTimeName === 'afternoon' || dayTimeName === 'morning') {
    toggleTheme()
  }

  const footerEl = document.querySelector('#footer')
  if (!footerEl) {
    return false
  }

  const setThemeDarkEl = footerEl.querySelector('a[href="#dark"]')
  const setThemeLightEl = footerEl.querySelector('a[href="#light"]')
  if (!setThemeDarkEl || !setThemeLightEl) {
    return false
  }

  setThemeDarkEl.addEventListener('click', themeToggleClick)
  setThemeLightEl.addEventListener('click', themeToggleClick)

  function themeToggleClick(event) {
    event.preventDefault()
    toggleTheme()
  }

  function setThemeClasses(oldTheme, newTheme) {
    document.documentElement.classList.remove('theme-' + oldTheme)
    document.documentElement.classList.add('theme-' + newTheme)
  }

  function setThemeLogo(oldTheme, newTheme) {
    const logoEl = document.querySelector('#nav .logo')
    if (!logoEl) {
      return false
    }

    console.log(logoEl)
    console.log(logoEl.src)
    logoEl.src = logoEl.src.replace(newTheme, oldTheme)
    console.log(logoEl.src)
  }

  function toggleTheme() {
    const oldTheme = window.theme
    let newTheme = 'dark'

    if (oldTheme === 'dark') {
      newTheme = 'light'
    }

    window.theme = newTheme

    console.log('oldTheme', oldTheme)
    console.log('newTheme', newTheme)

    setThemeClasses(oldTheme, newTheme)
    setThemeLogo(oldTheme, newTheme)
  }
}

function setupGreeting() {
  const greetingEl = document.querySelector('#greeting')

  if (!greetingEl) {
    return false
  }

  const dayTimeName = getDayTimeName()
  greetingEl.innerText = 'Good ' + dayTimeName
}

;(function () {
  window.theme = 'dark'
  setupTheme()
  setupGreeting()
})()
