var child = require('child_process');
var spawn = child.spawn;

module.exports = function(option) {
	if (!option || !'bin' in option) {
		option = {
			bin: 'php'
		};
	}
	
	return function(path, args, done) {
		args.unshift(path);
		var output = '';
		try {
			var process = spawn(option.bin, args);
			
			process.stdout.on('data', function(data) {
				output += data;
			});
			
			process.stderr.on('data', function(data) {
				output += data;
			});
			
			process.on('error', function(error) {
				done(error);
			});
			
			process.on('close', function(code) {
				done(code, output);
			});
		} catch(error) {
			done(error);
		}
	}
};