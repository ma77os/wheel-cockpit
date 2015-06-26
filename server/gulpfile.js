var gulp = require('gulp');
var coffee = require('gulp-coffee');
var gutil = require('gulp-util');

var paths = {
	server: {
		src: './*.coffee',
		dest: './'
	},
	rtc: {
		src: './rtc/*.coffee',
		dest: './rtc'
	},
	utils: {
		src: './utils/*.coffee',
		dest: './utils'
	},
	test: {
		src: './test/*.coffee',
		dest: './test'
	}
}

gulp.task('scripts', function() {

	coffee_opt = { bare: true };

	gulp.src(paths.server.src)
		.pipe(coffee(coffee_opt).on('error', gutil.log))
		.pipe(gulp.dest(paths.server.dest));

	gulp.src(paths.rtc.src)
		.pipe(coffee(coffee_opt).on('error', gutil.log))
		.pipe(gulp.dest(paths.rtc.dest));

	gulp.src(paths.utils.src)
		.pipe(coffee(coffee_opt).on('error', gutil.log))
		.pipe(gulp.dest(paths.utils.dest));

	gulp.src(paths.test.src)
		.pipe(coffee(coffee_opt).on('error', gutil.log))
		.pipe(gulp.dest(paths.test.dest));
});

gulp.task('watch', function() {
	gulp.watch([paths.server.src, paths.rtc.src, paths.utils.src, paths.test.src], ['scripts']);
});

// The default task (called when you run 'gulp')
gulp.task('default', ['watch', 'scripts']);