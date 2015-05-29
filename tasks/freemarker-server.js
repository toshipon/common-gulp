var gulp = require('gulp');
var plugins = require("gulp-load-plugins")();
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var through = require("through2");
var express = require('express')
var Freemarker = require('freemarker.js');
var async = require('async');

	
function getModified(viewPath, modulesPath) {
	function modified(info) {
		return (info) ? new Date(info.mtime).getTime() : 0;
	}
	var viewInfo;
	try {
		viewInfo = fs.statSync(viewPath);
	} catch (e) {
		viewInfo = null;
	}
	var modulesInfo = fs.existsSync(modulesPath) ? fs.statSync(modulesPath) : 0;
	return modified(viewInfo) + modified(modulesInfo);
}

module.exports = function(serverConfig, freemarkerConfig, option) {
	option = option || {};
	
	var current = process.cwd();
	
	var viewRoot = path.join(current, freemarkerConfig.srcDir)
	var Fm = new Freemarker({
		viewRoot: viewRoot,
		options: {}
	});
	
	var app = express();
	app.use(express.static(path.join(current, serverConfig.rootDir)));
	
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
			
			var viewPath = path.join(viewRoot, view);
			var modulesPath = path.join(viewRoot, 'modules');
			
			async.waterfall([
				function(next) {
					var modified = getModified(viewPath, modulesPath);
					
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
							plugins.util.log('[ERROR] freemarker', errAry.join('\n'));
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
	
	return function() {
		return gulp
			.src(freemarkerConfig.configFile)
			.pipe(plugins.watch(freemarkerConfig.configFile))
			.pipe(plugins.yaml())
			.pipe(through.obj(function(file, enc, callback) {
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
				
				if (!isListened) {
					app.listen(port);
					plugins.util.log('Webserver started at http://0.0.0.0:' + port);
					isListened = true;
				}
				
				callback();
			}));
	};
};