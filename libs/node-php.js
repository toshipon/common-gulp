var plugins = require("gulp-load-plugins")();
var child = require('child_process');
var spawn = child.spawn;

module.exports = function(option) {
	if (!option || !('bin' in option)) {
		option = {
			bin: 'php'
		};
	}
	
	return function(path, args, execOptions, done) {
		args.unshift(path);
		if (arguments.length === 3) {
			done = execOptions;
		} else {
			args = execOptions.concat(args);
		}
		var output = '';
		var stderr = '';
		try {
			plugins.util.log('[INFO] exec command:', option.bin, args.join(' '));
			var process = spawn(option.bin, args);
			
			process.stdout.on('data', function(data) {
				output += data;
			});
			
			process.stderr.on('data', function(error) {
				stderr += error;
				output += error;
			});
			
			process.on('error', function(error) {
				done({
					path: path,
					args: args,
					message: error
				});
			});
			
			process.on('close', function(code, arg2) {
				if (code === 0) {
					done(null, output);
					return;
				}
				done({
					path: path,
					args: args,
					code: code,
					message: stderr
				}, output);
			});
		} catch(error) {
			done({
				path: path,
				args: args,
				message: error
			});
		}
	}
};