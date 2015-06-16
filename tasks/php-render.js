var gulp = require('gulp');
var plugins = require("gulp-load-plugins")();
var nodePath = require('path');
var through = require("through2");
var async = require('async');
var htmlmin = require('gulp-htmlmin');

var current = process.cwd();

module.exports = function(renderConfig, option) {
	option = option || {};
	var configFile = nodePath.join(current, renderConfig.configFile);
	var renderOption = (option.bin) ? {bin: nodePath.join(current, option.bin)} : {};
	var php = require('../libs/node-php')(renderOption);
	
	return function() {
		var compiledFiles = [];
		var destPath = nodePath.join(current, renderConfig.destDir);
		
		var isCompress = ('compress' in renderConfig) ? renderConfig.compress : false;
		console.log('isCompress', isCompress);
		return gulp
			.src(configFile)
			.pipe(plugins.yaml())
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
							plugins.util.log(plugins.util.colors.red('[ERROR] php', JSON.stringify(err, null, 2)));
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
			.pipe(plugins.if(isCompress, plugins.htmlmin(isCompress ? renderConfig.htmlmin.options : {})))
			.pipe(gulp.dest(destPath))
			.on('end', function() {
				plugins.util.log('HTML Compiled files:\n\t' + plugins.util.colors.magenta(compiledFiles.join('\n\t')));
			});
	};
};