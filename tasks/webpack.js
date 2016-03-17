var path = require('path');
var gulp = require('gulp');
var plugins = require("gulp-load-plugins")();
var webpackStream = require('webpack-stream');
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
		
		var root = (config.options.resolve && config.options.resolve.root) ? config.options.resolve.root : [];
		if (!Array.isArray(root)) {
			root = [root];
		}
		
		config.options.resolve = _.extend(config.options.resolve, {
			extensions: ['', '.js', '.json'],
			root: root.concat([config.srcDir])
		});
		
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
			.pipe(webpackStream(config.options))
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
	
	cls.watch = function(taskName, option) {
		var config = _.cloneDeep(this.config);
		if (!config.options) {
			config.options = {};
		}
		config.options.watch = true;
		return function() {
			return compile(path.join(config.srcDir, '**/*.js'), config, option);
		};
	};
	
	return Webpack;
})();

module.exports = {
	create: function(config) {
		return util.createTasks(new Webpack(config));
	}
};