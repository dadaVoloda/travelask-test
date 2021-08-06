'use strict';
const { src, dest } = require('gulp');
const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const webp = require('imagemin-webp');
const svgSprite = require('gulp-svg-sprite');
const webphtml = require('gulp-webp-html');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const fileinclude = require('gulp-file-include');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const browsersync = require('browser-sync').create();

let path = {
  build: {
    html: 'dist/',
    js: 'dist/js/',
    css: 'dist/css/',
    images: 'dist/img/',
    fonts: 'dist/fonts/',
  },
  src: {
    html: 'src/*.html',
    js: 'src/js/script.js',
    css: 'src/scss/style.scss',
    images: 'src/img/**/*.{jpg,png,svg,gif,ico}',
    fonts: 'src/fonts/*.{woff,woff2}',
  },
  watch: {
    html: 'src/**/*.html',
    js: 'src/js/**/*.js',
    css: 'src/scss/**/*.scss',
    images: 'src/img/**/*.{jpg,png,svg,gif,ico}',
  },
  clean: './dist',
};

function browserSync() {
  browsersync.init({
    server: {
      baseDir: './dist/',
    },
    port: 3000,
    notify: false,
  });
}

function html() {
  return src(path.src.html, { base: 'src/' })
    .pipe(plumber())
    .pipe(fileinclude())
    .pipe(webphtml())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
}

function css() {
  return src(path.src.css, { base: 'src/scss/' })
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        outputStyle: 'expanded',
      }),
    )
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 8 versions'],
        cascade: true,
      }),
    )
    .pipe(dest(path.build.css))
    .pipe(
      cssnano({
        zindex: false,
        discardComments: {
          removeAll: true,
        },
      }),
    )
    .pipe(
      rename({
        suffix: '.min',
        extname: '.css',
      }),
    )
    .pipe(sourcemaps.write('.'))
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream());
}

function js() {
  return src(path.src.js, { base: 'src/js/' })
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(fileinclude())
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(
      rename({
        suffix: '.min',
        extname: '.js',
      }),
    )
    .pipe(sourcemaps.write('.'))
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
}

function images() {
  return src(path.src.images)
    .pipe(newer(path.build.images))
    .pipe(
      imagemin([
        webp({
          quality: 75,
        }),
      ]),
    )
    .pipe(
      rename({
        extname: '.webp',
      }),
    )
    .pipe(dest(path.build.images))
    .pipe(src(path.src.images))
    .pipe(newer(path.build.images))
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        interlaced: true,
        optimizationLevel: 3,
      }),
    )
    .pipe(dest(path.build.images));
}

function svgTask() {
  return src('src/iconsprite/*.svg')
    .pipe(
      svgSprite({
        mode: {
          symbol: {
            sprite: '../sprite.svg',
          },
        },
        svg: {
          doctypeDeclaration: false,
          xmlDeclaration: false,
        },
        shape: {
          transform: [
            {
              svgo: {
                plugins: [{ removeAttrs: { attrs: '(fill|stroke)' } }, { removeXMLNS: true }],
              },
            },
          ],
        },
      }),
    )
    .pipe(dest(path.build.images));
}

function fonts() {
  return src(path.src.fonts).pipe(dest(path.build.fonts));
}

function clean() {
  return del(path.clean);
}

function watchFiles() {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.images], images);
  gulp.watch(['src/iconsprite/*.svg'], svgTask);
}

const build = gulp.series(clean, gulp.parallel(html, css, js, images, svgTask, fonts));
const watch = gulp.parallel(build, watchFiles, browserSync);

exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.svgTask = svgTask;
exports.fonts = fonts;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;
