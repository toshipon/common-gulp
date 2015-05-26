var path = require('path');
var gulp = require('gulp');
var plugins = require("gulp-load-plugins")();
var through = require('through2');
var _ = require('lodash');
var util = require('./util');

var compileLog = require('../libs/compile-log');

var current = process.cwd();

var Webpack = (function() {
	
	/**
	 * @constructor
	 */
	function Webpack(config) {
		this.config = config;
	}
	
	var cls = Webpack.prototype;
	
	/**
	 * compile
	 */
	function compile(target, config, option, callback) {
		config = _.clone(config);
		
		var isCompress = (option.isDebug !== undefined) ? !option.isDebug : config.compress;
		
		config.options.resolve ={
			extensions: ['', '.js', '.json'],
			root: config.srcDir
		};
		
		var srcDir = path.join(current, config.srcDir);
		
		return gulp
			.src(target)
			.pipe(plugins.filter([ '**', '!**/_*.js' ]))
			.pipe(plugins.plumber())
			.pipe(through.obj(function(file, enc, next) {
				// 指定したディレクトリに階層を維持して出力するようパスを修正
				var regex = new RegExp(path.extname(file.path) + '$');
				file.named = file.path.replace(srcDir, '').replace(regex, '');
				this.push(file);
				return next();
			}))
			.pipe(plugins.webpack(config.options))
			.pipe(plugins.if(isCompress, plugins.uglify(config.uglify)))
			.pipe(gulp.dest(config.destDir))
			.pipe(compileLog({logTemplate: 'Webpack Compiled files:'}))
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
			return compile(path.join(config.srcDir, '**/*.js'), config, option);
		};
	};
	
	//cls.watch = function() {
	//	gulp.watch(path.join(this.config.srcDir, '**/*.js'), ['webpack']);
	//};
	
	return Webpack;
})();

module.exports = {
	create: function(config) {
		return util.createTasks(new Webpack(config));
	}
};