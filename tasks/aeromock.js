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

			var port = self.config.port || '3183';
			var execOptions = [];
			if (self.config.execOptions) {
				execOptions = execOptions.concat(self.config.execOptions);
			}
			execOptions = execOptions.concat(['-p', port]);
			self.process = spawn('aeromock', execOptions);
			self.process.stdout.on('data', function(data) {
				var str = data.toString();
				if (isFirst) {
					isFirst = false;
					gutil.log('Aeromock:\n' + str);
				} else if (str.indexOf('Aeromock server listening') > -1) {
					gutil.log('Aeromock:\n' + str.replace(/\n/g, ''));
					gutil.log('Open', gutil.colors.magenta('http://localhost:' + port));
					doneWrap();
				} else if (str.match(/ページを描画できません。/)) {
					gutil.log('Aeromock error:\n', gutil.colors.red(str.replace('ページを描画できません。', '').replace(/<br\/>/g, '\n')));
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
		var viewPath = path.join(current, this.config.viewPath, 'index.ftl');
		var cmd = nodeUtil.format('ln -f %s %s', indexPath, viewPath);
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