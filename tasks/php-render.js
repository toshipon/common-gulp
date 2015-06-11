var gulp = require('gulp');
var gutil = require('gulp-util');
var nodePath = require('path');
var through = require("through2");
var yaml = require('gulp-yaml');
var async = require('async');

var current = process.cwd();

module.exports = function(renderConfig) {
	var php = require('../libs/node-php')();
	var configFile = nodePath.join(current, renderConfig.configFile);
	
	return function() {
		var compiledFiles = [];
		var destPath = nodePath.join(current, renderConfig.destDir);
		return gulp
			.src(configFile)
			.pipe(yaml())
			.pipe(through.obj(function(file, enc, callback) {
				var self = this;
				var config = JSON.parse(file.contents);
				
				var basename = nodePath.basename(file.path);
				
				var pages = config.pages;
				async.eachSeries(Object.keys(pages), function(name, next) {
					var execOptions = renderConfig.execOptions || [];
					var routerPath = nodePath.join(current, renderConfig.router);
					var configPath = nodePath.join(current, renderConfig.configFile);
					var viewPath = nodePath.join(current, renderConfig.srcDir);
					php(routerPath, [name, configPath, viewPath], execOptions, function(err, html) {
						if (err) {
							gutil.log(gutil.colors.red('[ERROR] php', JSON.stringify(err, null, 2)));
						}
						var f = file.clone();
						f.path = file.path.replace(basename, name.replace(/^\//, '') + '.html')
						f.contents = new Buffer(html, 'utf8');
						self.push(f);
						next();
					});
				}, function() {
					callback();
				});
			}))
			.pipe(through.obj(function(file, enc, callback) {
				this.push(file);
				compiledFiles.push(file.path.replace(current, ''));
				callback();
			}))
			.pipe(gulp.dest(destPath))
			.on('end', function() {
				gutil.log('HTML Compiled files:\n\t' + gutil.colors.magenta(compiledFiles.join('\n\t')));
			});
	};
};