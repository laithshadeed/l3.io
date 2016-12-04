'use strict';

import del from 'del';
import gulp from 'gulp';
import gulploadplugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import {exec as exec} from 'child_process';

gulp.task('default', ['build']);
gulp.task('build', ['index', 'markdown', 'ace', 'so', 'ln', 'favicon']);
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
    name: 'ace',
    cmd: `${resume} export --theme ${theme}-ace resume-ace.html`
  },
  {
    name: 'so',
    cmd: `${resume} export --theme ${theme}-stackoverflow resume-so.html`
  },
  {
    name: 'print',
    cmd: `${resume} export --theme ${theme}-sshorter resume-print.html`
  },
  {
    name: 'favicon',
    cmd: `${favicon} generate favicon-spec.json favicon-out.json . && ` +
      `${favicon} inject favicon-out.json . *.html`
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

gulp.task('serve', ['build'], () => {
  browserSync({
    logPrefix: 'l3.io',
    server: ['.'],
    port: 3000
  });
});

gulp.task('dist', ['build'], () => {
  return gulp.src([
    '*.{html,jpg,md,json,pdf,png,svg,ico,xml}',
    '!package.json',
    '!favicon-out.json',
    '!README.md'
  ]).pipe(gulp.dest('dist'));
});

gulp.task('lint', () => {
  gulp.src('gulpfile.babel.js')
    .pipe($.eslint())
    .pipe($.eslint.format());
});

gulp.task('serve:dist', ['dist'], () => {
  browserSync({
    logPrefix: 'l3.io',
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
    'Cache-Control': 'max-age=315360000, no-transform, public'
  };

  gulp.src('dist/*')
    .pipe($.awspublish.gzip())
    .pipe(publisher.publish(headers))
    .pipe($.awspublish.reporter());
});
