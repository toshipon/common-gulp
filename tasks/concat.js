var gulp = require('gulp');
var plugins = require("gulp-load-plugins")();

module.exports = function(config, option) {
	option = option || {};
	var isCompress = (option.isDebug !== undefined) ? !option.isDebug : config.compress;
	return function() {
		gulp
			.src(config.src)
			.pipe(plugins.concat(config.destName))
			.pipe(plugins.if(isCompress, plugins.uglify(config.uglify)))
			.pipe(gulp.dest(config.destDir));
	};
};