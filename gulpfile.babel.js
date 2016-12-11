'use strict';

import path from 'path';
import del from 'del';
import gulp from 'gulp';
import runSequence from 'run-sequence';
import gulploadplugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import swPrecache from 'sw-precache';
import pkg from './package.json';
import {exec as exec} from 'child_process';

gulp.task('default', ['dist']);
gulp.task('build', ['index', 'markdown', 'html', 'ln', 'favicon']);
gulp.task('clean', () => del.sync([
  '*.html', 'resume.md', '*.pdf', 'dist', 'browserconfig.xml', 'faviconData.json', 'manifest.json',
  '*.png', '*.ico', '*.svg'
]));

const $ = gulploadplugins();
const resume = './node_modules/.bin/resume';
const theme = './node_modules/jsonresume-theme';
const favicon = './node_modules/.bin/real-favicon';
const tasks = [
  {
    name: 'index',
    cmd: `${resume} export --theme ${theme}-business-card-minimal index.html`
  },
  {
    name: 'markdown',
    cmd: `${resume} export --theme ${theme}-markdown resume.md`
  },
  {
    name: 'html',
    cmd: `${resume} export --theme ${theme}-stackoverflow resume.html`
  },
  {
    name: 'print',
    cmd: `${resume} export --theme ${theme}-sshorter resume-print.html`
  },
  {
    name: 'favicon',
    cmd: `${favicon} generate favicon-spec.json favicon-out.json .`
  }
];

tasks.forEach(task => {
  gulp.task(task.name, ['clean'], cb => {
    exec(task.cmd, cb);
  });
});

gulp.task('pdf', ['print'], cb => {
  exec('./node_modules/.bin/html-pdf resume-print.html resume.pdf', cb);
});

gulp.task('ln', ['pdf'], cb => {
  exec('ln -sf resume.pdf r.pdf', cb);
});

gulp.task('favicon-inject', cb => {
	exec(`${favicon} inject favicon-out.json . *.html`, cb);
});

gulp.task('serve', ['build'], () => {
  browserSync({
    logPrefix: 'l3.io',
    server: ['.'],
    port: 3000
  });
});

gulp.task('copy-files', () => {
  gulp.src([
    '*.{html,jpg,md,json,pdf,png,svg,ico,xml}',
    '!package.json',
    '!favicon-out.json',
    '!README.md',
    '!LICENSE.md'
  ]).pipe(gulp.dest('dist'));

  gulp.src(['scripts/runtime-caching.js']).pipe(gulp.dest('dist/scripts'));
  gulp.src(['font/fontawesome.*']).pipe(gulp.dest('dist/font'));

  return gulp.src(['node_modules/sw-toolbox/sw-toolbox.js'])
    .pipe(gulp.dest('dist/scripts'));
});

gulp.task('dist', ['clean'], cb =>
	runSequence(
		'build',
		'favicon-inject',
		'copy-files',
		'generate-service-worker',
		cb
	)
);

gulp.task('serve:dist', ['dist'], () => {
  browserSync({
    logPrefix: 'l3.io',
    https: true,
    server: ['dist'],
    port: 3000
  });
});

gulp.task('publish', ['dist'], () => {
  const publisher = $.awspublish.create({
    region: 'eu-west-1',
    params: {
      Bucket: 'l3.io'
    }
  });

  const headers = {
    'Cache-Control': 'no-cache'
  };

  gulp.src('dist/*')
    .pipe($.awspublish.gzip())
    .pipe(publisher.publish(headers))
    .pipe($.awspublish.reporter());
});

gulp.task('sw-inject', cb => {
  exec('echo "<script>" > out && cat scripts/sw.js >> out && echo "</script></body>" >> out  && ' +
       "perl -pe 's@</body>@`cat out`@ge' -i dist/*.html && rm out", cb);
});

gulp.task('generate-service-worker', ['sw-inject'], () => {
  const rootDir = 'dist';
  const filepath = path.join(rootDir, 'service-worker.js');

  return swPrecache.write(filepath, {
    // Used to avoid cache conflicts when serving on localhost.
    cacheId: pkg.name,
    // sw-toolbox.js needs to be listed first. It sets up methods used in runtime-caching.js.
    importScripts: [
      'scripts/sw-toolbox.js',
      'scripts/runtime-caching.js'
    ],
    staticFileGlobs: [
      `${rootDir}/*.*`
    ],
    // Translates a static file path to the relative URL that it's served from.
    // This is '/' rather than path.sep because the paths returned from
    // glob always use '/'.
    stripPrefix: rootDir + '/'
  });
});
