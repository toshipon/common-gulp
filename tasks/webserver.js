var gulp = require('gulp');
var webserver = require('gulp-webserver');

module.exports = function(config) {
	var options = config.options || {};
	
	if (options.directoryListing === true) {
		options.directoryListing = {enable: true};
	} else if (typeof(options.directoryListing) !== 'object') {
		options.directoryListing = {enable: false};
	}
	options.directoryListing.path = config.rootDir;
	options.port = options.port || 3000;
	
	return function() {
		gulp.src(config.rootDir)
			.pipe(webserver(options));
	};
};