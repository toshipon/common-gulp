var gulp = require('gulp');
var plugins = require("gulp-load-plugins")();
var nodePath = require('path');
var _ = require('lodash');
var through = require("through2");
var express = require('express');

module.exports = function(serverConfig, renderConfig, option) {
	option = option || {};
	var current = process.cwd();
	var renderOption = (option.bin) ? {bin: nodePath.join(current, option.bin)} : {};
	var render = require('../libs/node-php')(renderOption);
	
	var app = express();
	
	function routing(routePath) {
		app.get(routePath, function(req, res) {
			var routerPath = nodePath.join(current, renderConfig.router);
			var configPath = nodePath.join(current, renderConfig.configFile);
			var viewPath = nodePath.join(current, renderConfig.srcDir);
			render(routerPath, [routePath, configPath, viewPath], function(err, html) {
				if (err) {
					plugins.util.log('[ERROR] php', err);
				}
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.end(html, 'utf-8');
			});
		});
	}
	
	var port = serverConfig.port || process.env.PORT || 3000;
	var isListened = false;
	
	return function() {
		return gulp
			.src(renderConfig.configFile)
			.pipe(plugins.watch(renderConfig.configFile))
			.pipe(plugins.yaml())
			.pipe(through.obj(function(file, enc, callback) {
				routing('/');
				
				var viewConfig = JSON.parse(file.contents);
				var pages = viewConfig.pages;
				for (var path in pages) {
					if (!pages.hasOwnProperty(path)) {
						continue;
					}
					routing(nodePath.join('/', path));
				}
				
				app.use(express.static(nodePath.join(current, serverConfig.rootDir), {redirect: false}));
				
				if (!isListened) {
					app.listen(port);
					plugins.util.log('Webserver started at http://localhost:' + port);
					isListened = true;
				}
				
				callback();
			}));
	};
};