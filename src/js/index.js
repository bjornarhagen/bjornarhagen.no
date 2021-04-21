const getDayTimeName = (currentTime = new Date()) => {
  const currentHour = currentTime.getHours()
  const splitMorning = 05
  const splitAfternoon = 12
  const splitEvening = 18

  if (currentHour >= splitAfternoon && currentHour < splitEvening) {
    // Between 12 and 18
    return 'afternoon'
  } else if (currentHour >= splitEvening || currentHour < splitMorning) {
    // Between 18 and 00, or between 00 and 05
    return 'evening'
  }
  // Between 05 and 12
  return 'morning'
}

function setupTheme() {
  window.theme = 'dark'
  const themeFromCookie = Cookies.get('theme')

  if (themeFromCookie && window.theme !== themeFromCookie) {
    themeToggleClick()
  } else if (!themeFromCookie) {
    const dayTimeName = getDayTimeName()
    if (window.theme === 'dark' && (dayTimeName === 'afternoon' || dayTimeName === 'morning')) {
      toggleTheme()
    }
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
    if (event) {
      event.preventDefault()
    }

    toggleTheme()
    Cookies.set('theme', window.theme)
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

    logoEl.src = logoEl.src.replace(newTheme, oldTheme)
  }

  function toggleTheme() {
    const oldTheme = window.theme
    let newTheme = 'dark'

    if (oldTheme === 'dark') {
      newTheme = 'light'
    }

    window.theme = newTheme

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

/*! https://github.com/js-cookie/js-cookie | js-cookie v2.2.1 | MIT */
!(function (a) {
  var b
  if (
    ('function' == typeof define && define.amd && (define(a), (b = !0)),
    'object' == typeof exports && ((module.exports = a()), (b = !0)),
    !b)
  ) {
    var c = window.Cookies,
      d = (window.Cookies = a())
    d.noConflict = function () {
      return (window.Cookies = c), d
    }
  }
})(function () {
  function a() {
    for (var a = 0, b = {}; a < arguments.length; a++) {
      var c = arguments[a]
      for (var d in c) b[d] = c[d]
    }
    return b
  }
  function b(a) {
    return a.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent)
  }
  function c(d) {
    function e() {}
    function f(b, c, f) {
      if ('undefined' != typeof document) {
        ;(f = a({ path: '/' }, e.defaults, f)),
          'number' == typeof f.expires && (f.expires = new Date(1 * new Date() + 864e5 * f.expires)),
          (f.expires = f.expires ? f.expires.toUTCString() : '')
        try {
          var g = JSON.stringify(c)
          ;/^[\{\[]/.test(g) && (c = g)
        } catch (j) {}
        ;(c = d.write
          ? d.write(c, b)
          : encodeURIComponent(c + '').replace(
              /%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,
              decodeURIComponent
            )),
          (b = encodeURIComponent(b + '')
            .replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
            .replace(/[\(\)]/g, escape))
        var h = ''
        for (var i in f) f[i] && ((h += '; ' + i), !0 !== f[i] && (h += '=' + f[i].split(';')[0]))
        return (document.cookie = b + '=' + c + h)
      }
    }
    function g(a, c) {
      if ('undefined' != typeof document) {
        for (var e = {}, f = document.cookie ? document.cookie.split('; ') : [], g = 0; g < f.length; g++) {
          var h = f[g].split('='),
            i = h.slice(1).join('=')
          c || '"' !== i.charAt(0) || (i = i.slice(1, -1))
          try {
            var j = b(h[0])
            if (((i = (d.read || d)(i, j) || b(i)), c))
              try {
                i = JSON.parse(i)
              } catch (k) {}
            if (((e[j] = i), a === j)) break
          } catch (k) {}
        }
        return a ? e[a] : e
      }
    }
    return (
      (e.set = f),
      (e.get = function (a) {
        return g(a, !1)
      }),
      (e.getJSON = function (a) {
        return g(a, !0)
      }),
      (e.remove = function (b, c) {
        f(b, '', a(c, { expires: -1 }))
      }),
      (e.defaults = {}),
      (e.withConverter = c),
      (e.clear = function () {
        document.cookie.split(';').forEach(function (c) {
          document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
        })
      }),
      e
    )
  }
  return c(function () {})
})
;(function () {
  setupTheme()
  setupGreeting()
})()
