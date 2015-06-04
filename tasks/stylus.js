var gulp = require('gulp');
var plugins = require("gulp-load-plugins")();
var path = require('path');
var through = require('through2');
var nib = require('nib');
var _ = require('lodash');
var multimatch = require('multimatch');
var util = require('./util');

var compileLog = require('../libs/compile-log');
var StylusDependency = require('../libs/stylus-dependency');

var Stylus = (function() {
	
	/**
	 * @constructor
	 */
	function Stylus(config) {
		this.config = config;
		this.srcDir = config.srcDir;
		this.destDir = config.destDir;
		this.dep = new StylusDependency();
		this.watchFiles = [];
	}
	
	var cls = Stylus.prototype;
	
	/**
	 * @private
	 * 指定したファイルがsrcDirに含まれているか
	 */
	function containSrcDir(srcDir, target) {
		return multimatch(target, path.join(srcDir, '**/*.styl')).length > 0;
	}
	
	function isImportFile(target) {
		return multimatch(target, '**/_*.styl').length > 0;
	}
	
	/**
	 * @private
	 * Stylusのコンパイル
	 * @param {String} srcDir
	 * @param {String} destDir
	 * @param {String or Array} target
	 * @param {Object} config
	 * @param {Object} option
	 * @param {Function} callback
	 */
	function compile(srcDir, destDir, target, config, option, callback) {
		config = _.clone(config);
		
		if (!('options' in config)) {
			config.options = {};
		}
		if (!('compress' in config.options)) {
			config.options.compress = true;
		}
		
		var isCompress = (option.isDebug !== undefined) ? !option.isDebug : config.options.compress;
		config.options.compress = isCompress;
		
		if (config.useNib) {
			config.options.use = [nib()];
		}
		
		return gulp
			.src(target, {base: srcDir})
			.pipe(plugins.filter([ '**', '!**/_*.styl' ]))
			.pipe(plugins.plumber())
			.pipe(plugins.stylus(config.options))
			.pipe(plugins.autoprefixer(config.autoprefixer.option))
			.pipe(gulp.dest(config.destDir))
			.pipe(compileLog({
				logTemplate: 'CSS Compiled files:',
				basePath: destDir
			}))
			// 一つ前のpipeのendイベントが発火するよう最後にpipeしておく
			.pipe(plugins.callback(function() {}));
	}
	
	/**
	 * stylusのビルド
	 */
	cls.compile = function(option) {
		var self = this;
		var config = this.config;
		return function() {
			return compile(self.srcDir, self.destDir, path.join(self.srcDir, '**/*.styl'), config, option);
		};
	};
	
	/**
	 * 依存関係の解析
	 */
	cls.analysisDependency = function() {
		var self = this;
		
		return gulp
			.src(path.join(self.srcDir, '**/*.styl'))
			.pipe(through.obj(function(file, enc, next) {
				if (file.isNull()) {
					return next();
				}
				
				var result = self.dep.parseImports(file.path, self.config.options);
				
				// 依存関係の無いStandAloneなファイルを監視対象に入れる
				if (!result && containSrcDir(self.srcDir, file.path) && !isImportFile(file.path)) {
					self.watchFiles.push(file.path);
				}
				
				return next();
			}))
			.on('end', function() {
				var deps = self.dep.getDependents();
				
				Object.keys(deps).forEach(function(key) {
					self.watchFiles.push(key);
					deps[key].forEach(function(path) {
						self.watchFiles.push(path);
					});
				});
				
				self.watchFiles = _.uniq(self.watchFiles);
			});
	};
	
	cls.watch = function(option) {
		var self = this;
		return function(done) {
			return gulp
				.watch(self.watchFiles)
				.on('change', function(event) {
					var changeFilePath = event.path;
					// 変更のあったファイルからコンパイルすべきファイルを見つけ出す
					var depParents = self.dep.getDependentParents(changeFilePath);
					var compileTarget = (depParents.length === 0) ? [changeFilePath] : depParents;
					
					if (compileTarget.length === 0) {
						return done();
					}
					
					compile(self.srcDir, self.destDir, compileTarget, self.config, option, function() {
						done();
					});
				});
		}
	};
	
	return Stylus;
})();

module.exports = {
	create: function(current, config) {
		return util.createTasks(new Stylus(config));
	}
};