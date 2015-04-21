var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    jasmine = require('gulp-jasmine'),
    watch = require('gulp-watch');

gulp.task('lint', function () {
    gulp.src(['./app/**/*.js', '!./app/bower_components/**'])
        .pipe(jshint())
        .on('error', swallowError)
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('test', function () {
    gulp.src(['./test/**/*-spec.js'])
        .pipe(jasmine())
        .on('error', swallowError);
});

gulp.task('default', ['lint', 'test']);

gulp.task('watch', function () {
    gulp.watch(['*.js', 'test/**/*.js'], ['default']);
});

gulp.task('dev', ['default', 'watch']);

// util
function swallowError(error) {
    console.log(error.toString());
    this.emit('end');
}
