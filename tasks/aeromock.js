var gutil = require('gulp-util');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var path = require('path');
var nodeUtil = require('util');
var util = require('./util');

var current = process.cwd();

var Aeromock = (function() {

	/**
	 * @constructor
	 */
	function Aeromock(config) {
		this.config = config;
		this.process = null;
	}
	
	var cls = Aeromock.prototype;
	
	cls.start = function(option) {
		var self = this;
		
		option = option || {};
		return function(done) {
			var isFirst = true;

			var isDone = false;
			function doneWrap() {
				if (!isDone) {
					isDone = true;
					done();
				}
			}

			var port = option.port || '3183';
			self.process = spawn('aeromock', ['-c', path.join(self.config.dir, 'config.yaml'), '-p', port]);
			self.process.stdout.on('data', function(data) {
				var str = data.toString();
				if (isFirst) {
					isFirst = false;
					gutil.log('Aeromock:\n' + str);
				} else if (str.indexOf('Aeromock server listening') > -1) {
					gutil.log('Aeromock:\n' + str.replace(/\n/g, ''));
					gutil.log('Open', gutil.colors.magenta('file://' + path.resolve(self.config.dir) + '/index.html'));
					doneWrap();
				} else if (str.match(/\tERROR\t/)) {
					gutil.log('Aeromock error:\n' + str);
					doneWrap();
				}
			});
			self.process.stderr.on('data', function(data) {
				gutil.log('Aeromock error: ' + data.toString().replace(/\n\$/, ''));
			});
			
			setTimeout(function() {
				doneWrap();
			}, 20 * 1000);
		}
	};
	
	cls.exit = function(done) {
		if (this.process === null) {
			done();
			return;
		}
		
		this.process.on('exit', function(code) {
			gutil.log('Exit', "'" + gutil.colors.cyan('Aeromock') + "'");
			done();
		});
		
		this.process.kill('SIGINT');
		
		setTimeout(function() {
			done();
		}, 3000);
	};
	
	cls.linkIndex = function(done) {
		var indexPath = path.join(current, this.config.dir, 'index.ftl');
		console.log('indexPath', indexPath);
		var cmd = nodeUtil.format('ln -f %s ../view/index.ftl', indexPath);
		exec(cmd, function(err, stdout, stderr) {
			if (err) {
				gutil.log('[ERROR] link index error', err);
				done();
				return;
			}
			
			done();
		});
	};
	
	return Aeromock;
})();

module.exports = {
	create: function(config) {
		return util.createTasks(new Aeromock(config));
	}
};