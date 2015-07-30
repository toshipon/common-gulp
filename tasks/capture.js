var gulp = require('gulp');
var yaml = require('gulp-yaml');
var through = require("through2");
var path = require('path');
var Nightmare = require('nightmare');
var gutil = require('gulp-util');
var async = require('async');
var util = require('./util');
var rimraf = require('rimraf');
var fs = require('fs');

module.exports = function(config, option) {
	option = option || {};
	
	if (!config.viewport) {
		config.viewport = {
			width: 320,
			height: 480
		};
	}
	
	var html = fs.readFileSync(path.join(__dirname, '../templates/capture_index.html'));
	
	var nightmare = new Nightmare();
	return function() {
		gulp
			.src(config.srcViewConfig)
			.pipe(yaml())
			.pipe(through.obj(function(file, enc, callback) {
				var viewConfig = JSON.parse(file.contents);
				
				var urlInfoList = Object.keys(viewConfig.pages).map(function(url) {
					return {
						url: path.join(config.baseUrl, url),
						path: url
					};
				});
				
				rimraf(config.destDir, function() {
					var cnt = 0;
					var paths = [];
					async.eachSeries(urlInfoList, function(urlInfo, next) {
						cnt++;
						paths.push(urlInfo.path);
						var imagePath = path.join(config.destDir, urlInfo.path + '.png');
						nightmare
							.viewport(config.viewport.width, config.viewport.height)
							.goto(urlInfo.url);
						if (config.wait) {
							nightmare.wait(config.wait);
						}
						nightmare.screenshot(imagePath)
							.run(function(err) {
								if (err) {
									gutil.log(gutil.colors.red('[ERROR] capture', JSON.stringify(err, null, 2)));
								}
								gutil.log('[INFO] Captured', urlInfo.url, '=>', imagePath);
								next();
							});
					}, function() {
						var json = 'window.pathList=' + JSON.stringify(paths);
						fs.writeFileSync(path.join(config.destDir, 'pathList.js'), json);
						var html = fs.readFileSync(path.join(__dirname, '../templates/capture_index.html'));
						fs.writeFileSync(path.join(config.destDir, 'index.html'), html);
						callback();
					});
				});
				
			}))
			.pipe(gulp.dest(config.destDir))
			.on('end', function() {
				process.exit(0);
			});
	};
};
