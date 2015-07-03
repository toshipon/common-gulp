var gulp = require('gulp');
var gutil = require('gulp-util');
var path = require('path');
var through = require("through2");
var yaml = require('gulp-yaml');
var Freemarker = require('freemarker.js');
var async = require('async');
var _ = require('lodash');

var current = process.cwd();

module.exports = {
	compile: function(config) {
		var srcDir = path.join(current, config.srcDir);
		var Fm = new Freemarker({
			viewRoot: srcDir,
			options: {}
		});
		var configFile = path.join(current, config.configFile);
		
		return function() {
			var compiledFiles = [];
			return gulp
				.src(configFile)
				.pipe(yaml())
				.pipe(through.obj(function(file, enc, callback) {
					var self = this;
					var templateConfig = JSON.parse(file.contents);
					var commonData = (templateConfig.common && templateConfig.common.data) ? templateConfig.common.data : {};
					var pages = templateConfig.pages;
					
					if (config.hasIndex) {
						pages.index = {
							view: 'index.ftl',
							data: {
								'linkedPath': '/',
								pages: Object.keys(pages).map(function(key) {
									return key + '.html';
								})
							}
						};
					}
					
					var basename = path.basename(file.path);
					
					// parallelにループする
					async.each(Object.keys(pages), function(name, next) {
						var page = pages[name];
						var data = _.merge(_.cloneDeep(commonData), page.data);
						Fm.render(page.view, data, function(err, out, msg) {
							var f = file.clone();
							f.path = file.path.replace(basename, name + '.json')
							f.contents = new Buffer(out || msg);
							self.push(f);
							next();
						});
					}, function() {
						callback();
					});
				}))
				.pipe(through.obj(function(file, enc, callback) {
					file.path = file.path.replace(path.extname(file.path), '.html');
					this.push(file);
					compiledFiles.push(file.path.replace(current, ''));
					callback();
				}))
				.pipe(gulp.dest(config.destDir))
				.on('end', function() {
					gutil.log('HTML Compiled files:\n\t' + gutil.colors.magenta(compiledFiles.join('\n\t')));
				});
		};
	}
};