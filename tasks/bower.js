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
		this.config = config;
		this.installDir = path.join(config.cwd, getDirectory(config.directory));
	}
	
	var cls = Bower.prototype;
	
	function getDirectory(directory) {
		return directory || 'bower_components';
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
		return plugins.bower({cwd: this.config.cwd, directory: getDirectory(this.config.directory)})
			.pipe(plugins.notify({message: 'Bower installed.', onLast: true}));
	};
	
	cls.update = function() {
		return plugins.bower({cmd: 'update', cwd: this.config.cwd, directory: getDirectory(this.config.directory)})
			.pipe(plugins.notify({message: 'Bower updated.', onLast: true}));
	};
	
	return Bower;
})();

module.exports = {
	create: function(config) {
		return util.createTasks(new Bower(config));
	}
};