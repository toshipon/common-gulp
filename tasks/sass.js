var path = require('path');
var gulp = require('gulp');
var $ = require("gulp-load-plugins")();
var _ = require('lodash');
var util = require('./util');
var compileLog = require('../libs/compile-log');
var moduleImporter = require('sass-module-importer');

var Sass = (function() {
	/**
	 * @constructor
	 */
	function Sass(config) {
		this.config = config;
	}
	
	var cls = Sass.prototype;
	
	function compile(target, config, option) {
		config = _.clone(config);
		config.options = config.options || {};
		
		var isCompress = (option.isDebug !== undefined) ? !option.isDebug : config.compress;
		if (isCompress) {
			config.options.outputStyle = 'compressed';
		}
		
		if (option.isDebug) {
			config.options.sourceComments = true;
		}
		
		config.options.importer = moduleImporter();
		
		return gulp
			.src(target)
			.pipe($.filter([ '**', '!**/_*.scss' ]))
			.pipe($.plumber({errorHandler: $.notify.onError('<%= error.message %>')}))
			.pipe($.sass(config.options))
			.pipe($.autoprefixer(config.autoprefixer.options))
			.pipe(gulp.dest(config.destDir))
			.pipe(compileLog({logTemplate: 'Sass Compiled files:'}))
			// 一つ前のpipeのendイベントが発火するよう最後にpipeしておく
			.pipe($.callback(function() {}));
			// .pipe($.wait(1000))
			// .pipe($.livereload());
	}
	
	cls.compile = function(option) {
		var self = this;
		return function() {
			return compile(path.join(self.config.srcDir, '**/*.scss'), self.config, option);
		};
	};
	
	cls.watch = function(option) {
		var self = this;
		return function() {
			var target = path.join(self.config.srcDir, '**/*.scss');
			return gulp.watch(target)
				.on('change', function(event) {
					self.compile(option)();
				});
		};
	};
	
	return Sass;
})();


module.exports = {
	create: function(config) {
		return util.createTasks(new Sass(config));
	}
};