var gulp = require('gulp');
var plugins = require("gulp-load-plugins")();
var nodePath = require('path');
var fs = require('fs');
var _ = require('lodash');
var through = require("through2");
var express = require('express')
var Freemarker = require('freemarker.js');
var async = require('async');

function getModified(viewPath, watchDirs) {
	function modified(info) {
		return (info) ? new Date(info.mtime).getTime() : 0;
	}
	var viewInfo;
	try {
		viewInfo = fs.statSync(viewPath);
	} catch (e) {
		viewInfo = null;
	}
	
	var watchDirsModified = 0;
	if (watchDirs) {
		watchDirs.forEach(function(dirPath) {
			if (!fs.existsSync(dirPath)) {
				return;
			}
			watchDirsModified += modified(fs.statSync(dirPath));
		});
	}
	
	return modified(viewInfo) + watchDirsModified;
}

module.exports = function(serverConfig, freemarkerConfig, option) {
	option = option || {};
	
	var current = process.cwd();
	
	var viewRoot = nodePath.join(current, freemarkerConfig.srcDir)
	var Fm = new Freemarker({
		viewRoot: viewRoot,
		options: {}
	});
	
	var watchDirs;
	if (serverConfig.watchDirs) {
		watchDirs = serverConfig.watchDirs.map(function(dir) {
			return nodePath.join(viewRoot, dir, '**.ftl');
		});
	}
	
	var app = express();
	
	var viewCache;
	var viewConfig;
	
	function routing(routePath) {
		var uri = (routePath === 'index') ? '/' : '/' + routePath;
		app.get(uri, function(req, res) {
			var pages = viewConfig.pages;
			var page = pages[routePath];
			var view = page.view;
			
			var commonData = (viewConfig.common && viewConfig.common.data) ? _.cloneDeep(viewConfig.common.data) : {};
			var pageData = (page.data) ? _.cloneDeep(page.data) : {};
			var data = _.merge(commonData, pageData);
			
			var viewPath = nodePath.join(viewRoot, view);
			
			async.waterfall([
				function(next) {
					var modified = getModified(viewPath, watchDirs);
					
					var cache = viewCache[routePath];
					if (cache) {
						if (cache.modified === modified) {
							next(cache.html);
							return;
						}
					}
					
					Fm.render(view, data, function(err, out, msg) {
						if (err) {
							var errAry = err.split('\n');
							errAry.shift();
							errAry.pop();
							out = errAry.join('\n');
							plugins.util.log('[ERROR] freemarker', out);
							out = '<pre>' + out + '</pre>';
						}
						viewCache[routePath] = {html: out, modified: modified};
						next(out);
					});
				}
			], function(html, next) {
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.end(html, 'utf-8');
			});
		});
	}
	
	var port = serverConfig.port || 3000;
	var isListened = false;
	
	gulp.watch(freemarkerConfig.configFile, function(e) {
		server(function() {
			plugins.util.log('[INFO] Reload server.');
		});
	});
	
	gulp.watch(watchDirs, function(e) {
		plugins.util.log('[INFO] Clear cache.');
		viewCache = {};
	});
	
	function server(callback) {
		
		return gulp
			.src(freemarkerConfig.configFile)
			//.pipe(plugins.watch(freemarkerConfig.configFile))
			.pipe(plugins.yaml())
			.pipe(through.obj(function(file, enc, next) {
				viewCache = {};
				viewConfig = JSON.parse(file.contents);
				
				viewConfig.pages.index = {
					view: 'index.ftl',
					data: {
						'linkedPath': '/',
						pages: Object.keys(viewConfig.pages)
					}
				};
				
				routing('index');
				
				var pages = viewConfig.pages;
				for (var path in pages) {
					if (!pages.hasOwnProperty(path)) {
						continue;
					}
					routing(path);
				}
				
				app.use(express.static(nodePath.join(current, serverConfig.rootDir), {redirect: false}));
				
				if (!isListened) {
					app.listen(port);
					plugins.util.log('Webserver started at http://localhost:' + port);
					isListened = true;
				}
				
				callback();
			}));
	}
	
	return server;
};