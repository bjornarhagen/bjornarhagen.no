;(function () {
  const button = document.querySelector('#cookies-page-clear-button')
  const statusDisplay = document.createElement('p')
  button.parentNode.appendChild(statusDisplay)

  button.addEventListener('click', function () {
    Cookies.clear()
    Cookies.remove('')

    statusDisplay.textContent = 'Done!'

    setTimeout(function () {
      statusDisplay.textContent = ''
    }, 3000)
  })
})()
