'use strict'

const gulp = require('gulp')
const sass = require('gulp-sass')
const uglify = require('gulp-uglify')
const rename = require('gulp-rename')
const browserSync = require('browser-sync').create()
const nunjucksRender = require('gulp-nunjucks-render')
const imagemin = require('gulp-imagemin')

gulp.task('nunjucks', function () {
  return gulp
    .src([
      // Folder(s) to look in for content files
      'src/pages/**/*.+(html|nunjucks)',
    ])
    .pipe(
      nunjucksRender({
        path: ['src/templates'], // Folder to look in for templates that are included/extended
      })
    )
    .pipe(gulp.dest('dist')) // Output rendered HTML in folder
    .pipe(browserSync.stream())
})

gulp.task('nunjucks:watch', function () {
  gulp.watch('./src/**/*.nunjucks', gulp.parallel('nunjucks'))
})

gulp.task('copy', function () {
  return gulp
    .src(['src/pages/**/*.+(php|css|jpg|png|svg|gif)', 'src/extra/**/*.+(php|css|jpg|png|svg|gif|xml|json|html)'])
    .pipe(gulp.dest('./dist/'))
})

gulp.task('js', function () {
  return gulp.src(['./src/js/**/*.js', '!./src/js/**/*.min.js']).pipe(gulp.dest('./dist/js'))
  // .pipe(uglify())
  // .pipe(rename({
  //   suffix: '.min'
  // }))
  // .pipe(gulp.dest('./dist/js'))
})

gulp.task('scss', function () {
  return gulp
    .src(['./src/scss/reset.scss', './src/scss/global.scss'])
    .pipe(
      sass({
        outputStyle: 'expanded',
      }).on('error', sass.logError)
    )
    .pipe(gulp.dest('./dist/css'))
    .pipe(browserSync.stream())
})

gulp.task('scss:watch', function () {
  gulp.watch('./src/scss/**/*.scss', gulp.parallel('scss'))
})

gulp.task('image', function () {
  return gulp
    .src('src/images/**/*.{png,gif,jpg,jpeg,svg}')
    .pipe(
      imagemin([
        imagemin.gifsicle({
          interlaced: true,
        }),
        imagemin.mozjpeg({
          progressive: true,
        }),
        imagemin.optipng({
          optimizationLevel: 5,
        }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: true,
            },
            {
              cleanupIDs: false,
            },
          ],
        }),
      ])
    )
    .pipe(gulp.dest('dist/images'))
})

gulp.task('browser-sync', function () {
  browserSync.init({
    open: false,
    notify: false,
    server: {
      baseDir: './dist',
      serveStaticOptions: {
        extensions: ['html'],
      },
    },
  })
})

gulp.task('watch', gulp.parallel('browser-sync', 'scss:watch', 'nunjucks:watch'))
gulp.task('build', gulp.parallel('copy', 'js', 'scss', 'nunjucks', 'image'))
gulp.task('default', gulp.parallel('build', 'watch'))
