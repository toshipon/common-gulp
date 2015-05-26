var gutil = require('gulp-util');
var through = require('through2');

module.exports = function(option) {
	var compiledFiles = [];
	var logTemplate = option.logTemplate;
	var stream = through.obj(function(file, enc, next) {
		if (file.isNull()) {
			this.push(next);
			return;
		}
		compiledFiles.push(file.path);
		return next();
	});
	stream.on('end', function() {
		gutil.log(logTemplate + '\n\t' + gutil.colors.magenta(compiledFiles.join('\n\t')));
	});
	return stream;
};