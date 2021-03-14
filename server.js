const bs = require('browser-sync').create()

bs.init({
  server: './public',
  open: false,
  files: ['**/*.html', '**/*.css'],
})
