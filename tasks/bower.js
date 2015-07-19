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
		this.installDir = path.join(config.rootDir, config.directory || 'bower_components');
	}
	
	var cls = Bower.prototype;
	
	cls.install = function() {
		if (fs.existsSync(this.installDir)) {
			return;
		}
		return plugins.bower({cwd: this.config.rootDir})
			.pipe(plugins.notify({message: 'Bower installed.', onLast: true}));
	};
	
	cls.update = function() {
		return plugins.bower({cmd: 'update', cwd: this.config.rootDir})
			.pipe(plugins.notify({message: 'Bower updated.', onLast: true}));
	};
	
	return Bower;
})();

module.exports = {
	create: function(config) {
		return util.createTasks(new Bower(config));
	}
};