var path = require('path');
var gulp = require('gulp');
var plugins = require("gulp-load-plugins")();
var through = require('through2');
var _ = require('lodash');

var compileLog = require('../libs/compile-log');

var current = process.cwd();

var templateName;
var templateStream;
var templateExt;
var templateDestExt;

var Template = (function() {
	
	/**
	 * @constructor
	 */
	function Template(config) {
		this.config = config;
	}
	
	var cls = Template.prototype;
	
	/**
	 * compile
	 */
	function compile(target, config, option, callback) {
		config = _.clone(config);
		
		var isCompress = (option.isDebug !== undefined) ? !option.isDebug : config.compress;
		
		var srcDir = path.join(current, config.srcDir);
		
		return gulp
			.src(target)
			.pipe(plugins.filter([ '**', '!**/_*.' + templateExt ]))
			.pipe(plugins.plumber())
			.pipe(through.obj(function(file, enc, next) {
				// 指定したディレクトリに階層を維持して出力するようパスを修正
				var regex = new RegExp(path.extname(file.path) + '$');
				file.named = file.path.replace(srcDir, '').replace(regex, '');
				file.path = file.path.replace(new RegExp(templateExt + '$'), templateDestExt);
				this.push(file);
				return next();
			}))
			.pipe(templateStream(config.options))
			//.pipe(plugins.if(isCompress, plugins.uglify(config.uglify)))
			.pipe(gulp.dest(config.destDir))
			.pipe(compileLog({logTemplate: templateName + ' Compiled files:'}))
			// 一つ前のpipeのendイベントが発火するよう最後にpipeしておく
			.pipe(plugins.callback(function() {}));
	}
	
	/**
	 * webpackのビルド
	 * @param option
	 * @returns {Function}
	 */
	cls.compile = function(option) {
		var config = this.config;
		return function() {
			return compile(path.join(config.srcDir, '**/*.' + templateExt), config, option);
		};
	};
	
	cls.watch = function(option) {
		var self = this;
		return function() {
			var watchDirs = [
				path.join(self.config.srcDir, '**/*.' + templateExt)
			];
			
			gulp.watch(watchDirs)
				.on('change', function(event) {
					self.compile(option)();
				});
		};
	};
	
	return Template;
})();

module.exports = {
	load: function(name, template, ext, destExt) {
		templateName = name;
		templateStream = template;
		templateExt = ext;
		templateDestExt = destExt;
		return Template;
	}
};