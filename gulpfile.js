'use strict'

const gulp = require('gulp')
const sass = require('gulp-sass')
const uglify = require('gulp-uglify')
const rename = require('gulp-rename')
const browserSync = require('browser-sync').create()
const nunjucksRender = require('gulp-nunjucks-render')

gulp.task('nunjucks', function () {
  return gulp
    .src([
      // Folder(s) to look in for content files
      'src/pages/**/*.+(nunjucks)',
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

gulp.task('copy-pages', function () {
  return gulp
    .src(['src/pages/**/*.+(css|js|jpg|jpeg|png|svg|gif|xml|json|html)', '!./src/**/node_modules/**'])
    .pipe(gulp.dest('./dist/'))
    .pipe(browserSync.stream())
})

gulp.task('copy-extra', function () {
  return gulp.src(['src/extra/**/*']).pipe(gulp.dest('./dist/')).pipe(browserSync.stream())
})

gulp.task('copy-images', function () {
  return gulp
    .src(['src/images/**/*.+(jpg|jpeg|png|svg|gif)'])
    .pipe(gulp.dest('./dist/images/'))
    .pipe(browserSync.stream())
})

gulp.task('copy-fonts', function () {
  return gulp.src(['src/fonts/**/*.+(woff2|css)']).pipe(gulp.dest('./dist/fonts/')).pipe(browserSync.stream())
})

gulp.task('copy-styles', function () {
  return gulp.src(['src/css/**/*.css']).pipe(gulp.dest('./dist/css/')).pipe(browserSync.stream())
})

gulp.task('copy', function () {
  return gulp.parallel('copy-pages', 'copy-extra', 'copy-fonts', 'copy-images', 'copy-styles')
})

gulp.task('copy:watch', function () {
  gulp.watch(
    [
      './src/pages/**/*.*',
      './src/extra/**/*.*',
      './src/fonts/**/*.*',
      './src/images/**/*.*',
      './src/css/**/*.*',
      ,
      '!./src/**/*.nunjucks',
      '!./src/**/node_modules/**',
    ],
    gulp.parallel('copy-pages', 'copy-extra', 'copy-fonts', 'copy-images', 'copy-styles')
  )
})

gulp.task('js', function () {
  return gulp
    .src(['./src/js/**/*.js', '!./src/js/**/*.min.js'])
    .pipe(gulp.dest('./dist/js'))
    .pipe(uglify())
    .pipe(
      rename({
        suffix: '.min',
      })
    )
    .pipe(gulp.dest('./dist/js'))
})

gulp.task('js:watch', function () {
  gulp.watch(['./src/js/**/*.js', '!./src/js/**/*.min.js'], gulp.parallel('js'))
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

gulp.task('watch', gulp.parallel('browser-sync', 'scss:watch', 'nunjucks:watch', 'js:watch', 'copy:watch'))
gulp.task(
  'build',
  gulp.parallel('copy-pages', 'copy-extra', 'copy-fonts', 'copy-images', 'copy-styles', 'js', 'scss', 'nunjucks')
)
gulp.task('default', gulp.parallel('build', 'watch'))
