var gulp = require('gulp');
var plugins = require("gulp-load-plugins")();
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var util = require('./util');

var Bower = (function() {
	
	/**
	 * @constructor
	 */
	function Bower(config) {
		config = config || {};
		config.cwd = config.cwd || './';
		config.directory = config.directory || 'bower_components';
		this.installDir = getInstallDir(config);
		this.config = config;
	}
	
	var cls = Bower.prototype;
	
	function getInstallDir(config) {
		var installDir = null;
		
		var bowerrc = path.join(config.cwd, '.bowerrc');
		if (fs.existsSync(bowerrc)) {
			var bower_config = JSON.parse(fs.readFileSync(bowerrc));
			installDir = path.join(config.cwd, bower_config.directory);
		} else {
			installDir = path.join(config.cwd, config.directory);
		}
		
		return installDir || path.join(config.cwd, './bower_components');
	}

	/**
	 * @return {Boolean}
	 */
	cls.isInstalled = function() {
		return fs.existsSync(this.installDir);
	};
	
	cls.install = function() {
		if (this.isInstalled()) {
			return;
		}
		return plugins.bower({cwd: this.config.cwd, directory: this.config.directory})
			.pipe(plugins.notify({message: 'Bower installed.', onLast: true}));
	};
	
	cls.update = function() {
		return plugins.bower({cmd: 'update', cwd: this.config.cwd, directory: this.config.directory})
			.pipe(plugins.notify({message: 'Bower updated.', onLast: true}));
	};
	
	return Bower;
})();

module.exports = {
	create: function(config) {
		return util.createTasks(new Bower(config));
	}
};
