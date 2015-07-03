var gulp = require('gulp');
var concat = require('gulp-concat');

module.exports = function(config, option) {
	option = option || {};
	return function() {
		var spriteData = gulp
			.src(config.src)
			.pipe(concat(config.destName))
			.pipe(gulp.dest(config.destDir));
	};
};