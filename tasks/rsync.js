var gulp = require('gulp');
var rsync = require('gulp-rsync');
var path = require('path');

module.exports = function(config, option) {
	option = option || {};
	return function() {
		gulp.src(path.join(config.rootDir, '/**'))
			.pipe(rsync({
				username: config.username,
				hostname: config.hostname,
				root: config.rootDir,
				destination: config.destination
			}));
	}
};