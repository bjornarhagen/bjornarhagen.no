'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const php = require('gulp-connect-php');
const browserSync = require('browser-sync').create();
// const nunjucksRender = require('gulp-nunjucks-render');
const imagemin = require('gulp-imagemin');

// gulp.task('nunjucks', function() {
//   return gulp.src([       // Folder(s) to look in for content files
//     'src/html/**/*.+(html|nunjucks)',
//     '!src/templates/*.+(html|nunjucks)',
//   ])
//   .pipe(nunjucksRender({
//     path: ['src/html/templates'] // Folder to look in for templates that are included/extended
//   }))
//   .pipe(gulp.dest('dist')) // Output rendered HTML in folder
// });

// gulp.task('nunjucks:watch', function() {
//   gulp.watch('./src/**/*.nunjucks', ['nunjucks', browserSync.reload]);
// });

// gulp.task('js', function() {
//   gulp.src([
//     './js/**/*.js',
//     '!./js/**/*.min.js'
//   ])
//     .pipe(uglify())
//     .pipe(rename({
//       suffix: '.min'
//     }))
//     .pipe(gulp.dest('./js'))
// })

gulp.task('sass', function() {
  return gulp.src([
    './assets/scss/app.scss'
  ])
    .pipe(sass({
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(gulp.dest('./public/css'))
    .pipe(browserSync.stream());
});

gulp.task('sass:watch', function() {
  gulp.watch('./assets/scss/**/*.scss', ['sass']);
});

gulp.task('php', function() {
  php.server({
    base: './public',
    port: 8080,
    keepalive: true
  });
});


// gulp.task('image', function() {
//   gulp.src('src/images/**/*.{png,gif,jpg,jpeg,svg}')
//     .pipe(imagemin([
//       imagemin.gifsicle({
//         interlaced: true
//       }),
//       imagemin.jpegtran({
//         progressive: true
//       }),
//       imagemin.optipng({
//         optimizationLevel: 5
//       }),
//       imagemin.svgo({
//         plugins: [{
//             removeViewBox: true
//           },
//           {
//             cleanupIDs: false
//           }
//         ]
//       })
//     ]))
//     .pipe(gulp.dest('dist/images'))
// });

gulp.task('browser-sync-php', function() {
  browserSync.init({
    proxy: '127.0.0.1:8080',
    open: true,
    notify: false
  });
});

gulp.task('browser-sync', function() {
  browserSync.init({
    open: true,
    notify: false,
    server: {
      baseDir: './public'
    }
  });
});

// gulp.task('default', ['js', 'sass', 'nunjucks', 'browser-sync', 'image', 'sass:watch', 'nunjucks:watch']);

gulp.task('default', ['sass', 'php', 'browser-sync-php', 'sass:watch'], function () {
  gulp.watch(['./**/*.php'], [browserSync.reload]);
});

gulp.task('build', ['js', 'sass', 'nunjucks']);
