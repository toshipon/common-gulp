/**
 * gulpfile example
 */
var gulp = require('gulp');
var path = require('path');

var commonGulp = require('common-gulp');
var minimist = commonGulp.minimist;
var tasks = commonGulp.tasks;

var args = minimist(process.argv.slice(2));
var isDebug = args && args.d;

var current = process.cwd();
var config = require('./gulpconfig');

var defaults = [];

// stylus
if (config.stylus) {
	Object.keys(config.stylus).forEach(function(type) {
		var stylus = tasks.Stylus.create(current, config.stylus[type]);
		gulp.task('stylus-compile:' + type, stylus.compile({isDebug: isDebug}));
		gulp.task('stylus-analysisDependency:' + type, stylus.analysisDependency);
		gulp.task('stylus-watch:' + type, ['stylus-analysisDependency:' + type], stylus.watch({isDebug: isDebug}));
		defaults.push('stylus-compile:' + type);
		defaults.push('stylus-watch:' + type);
	});
}

// webpack
if (config.webpack) {
	Object.keys(config.webpack).forEach(function(type) {
		var webpack = tasks.Webpack.create(config.webpack[type]);
		gulp.task('webpack-compile:' + type, webpack.compile({isDebug: isDebug}));
		gulp.task('webpack-watch:' + type, function() {
			gulp.watch(path.join(config.webpack.srcDir, '**/*.js'), ['webpack-compile:' + type]);
		});
		defaults.push('webpack-compile:' + type);
		defaults.push('webpack-watch:' + type);
	});
}

// sprite
if (config.sprite) {
	Object.keys(config.sprite).forEach(function(type) {
		gulp.task('sprite:' + type, tasks.Sprite(config.sprite[type]));
	});
}

// webserver
if (config.webserver) {
	gulp.task('webserver', tasks.Webserver(config.webserver));
}

// aeromock
if (config.aeromock) {
	var aeromock = tasks.Aeromock.create(config.aeromock);
	gulp.task('aeromock-linkIndex', aeromock.linkIndex);
	gulp.task('aeromock-start', ['aeromock-linkIndex'], aeromock.start());
	// gulpのプロセス終了時にaeromockのプロセスを終了させる
	process.on('SIGINT', function() {
		aeromock.exit(function() {
			exit();
		});
	});
	defaults.push('aeromock-start');
}

// rsync
if (config.rsync) {
	Object.keys(config.rsync).forEach(function(type) {
		gulp.task('rsync:' + type, tasks.Rsync(config.rsync[type]));
	});
}

// freemarker
if (config.freemarker) {
	gulp.task('html', tasks.Freemarker.compile(config.freemarker));
}

// freemarker server
if (config.freemarkerServer) {
	gulp.task('freemarker-server', tasks.FreemarkerServer(config.freemarkerServer, config.freemarker));
	defaults.push('freemarker-server');
}

gulp.task('default', defaults);