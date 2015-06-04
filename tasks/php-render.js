var spawn = require('child_process').spawn;
var connect = require('gulp-connect-php');
var yaml = require('gulp-yaml');

var current = process.cwd();

module.exports = function(config) {
	var configFile = path.join(current, config.configFile);
	return function() {
		var process = spawn('aeromock', ['-c', path.join(self.config.dir, 'config.yaml'), '-p', port]);
		return gulp
			.src(configFile)
			.pipe(yaml())
	};
};