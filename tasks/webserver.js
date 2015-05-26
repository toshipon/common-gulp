var gulp = require('gulp');
var webserver = require('gulp-webserver');

module.exports = function(config, option) {
	option = option || {};
	
	return function() {
		gulp.src(config.rootDir)
			.pipe(webserver({
				host:'0.0.0.0',
				directoryListing: {
					enable: true,
					path: config.rootDir
				},
				port: config.port || 3000
			}));
	};
};