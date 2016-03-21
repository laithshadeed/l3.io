var fs   = require('fs');
var gulp = require('gulp');
var exec = require('child_process').exec;
var files = ['index.html', 'resume.md', 'resume-ace.html', 'resume-so.html', 'resume-print.html', 'resume.pdf', 'r.pdf'];
gulp.task('default', ['build']);
gulp.task('build', ['clean', 'index', 'markdown', 'ace', 'so', 'pdf']);

gulp.task('dist', ['build'], function() {
  gulp.src('*.html').pipe(gulp.dest('dist'));
  gulp.src('resume.json').pipe(gulp.dest('dist'));
  gulp.src('resume.md').pipe(gulp.dest('dist'));
  gulp.src('*.pdf').pipe(gulp.dest('dist'));
})

gulp.task('clean', function(cb) {
  files.forEach(function(file) {
    try { fs.unlinkSync(file) } catch(e) {}
  });
  exec('rm -rf ./dist/', cb);
});

gulp.task('serve', ['build'],  function(cb) {
  var cmd = './node_modules/.bin/resume serve --theme ' +
            './node_modules/jsonresume-theme-business-card-minimal';

  exec(cmd, function(err) {
    cb();
  });
});

gulp.task('index', function(cb) {
  var cmd = './node_modules/.bin/resume export --theme ' +
            './node_modules/jsonresume-theme-business-card-minimal index.html';

  exec(cmd, function(err) {
    cb();
  });
});

gulp.task('markdown', function(cb) {
  var cmd = './node_modules/.bin/resume export --theme ' +
            './node_modules/jsonresume-theme-markdown resume.md';

  exec(cmd, function(err) {
    cb(err);
  });
});

gulp.task('ace', function(cb) {
  var cmd = './node_modules/.bin/resume export --theme ' +
            './node_modules/jsonresume-theme-ace resume-ace.html';

  exec(cmd, function(err) {
    cb(err);
  });
});

gulp.task('so', function(cb) {
  var cmd = './node_modules/.bin/resume export --theme ' +
            './node_modules/jsonresume-theme-stackoverflow resume-so.html';

  exec(cmd, function(err) {
    cb(err);
  });
});

gulp.task('print', function(cb) {
  var cmd = './node_modules/.bin/resume export --theme ' +
            './node_modules/jsonresume-theme-sshorter resume-print.html';

  exec(cmd, function(err) {
    cb(err);
  });
});

gulp.task('pdf', ['print'], function(cb) {
  var cmd = './node_modules/.bin/html-pdf resume-print.html resume.pdf'

  exec(cmd, function(err) {
    exec('ln -sf resume.pdf r.pdf', function(err) {
      cb(err);
    });
  });
});
