/**
 * gulpfile example
 */
var gulp = require('gulp');
var minimist = require('minimist');
var path = require('path');

var tasks = require('index');

var args = minimist(process.argv.slice(2));
var isDebug = args && args.d;

var current = process.cwd();
var config = require('./gulpconfig');

// stylus
var stylus = tasks.Stylus.create(current, config.stylus);
gulp.task('stylus-compile', stylus.compile({isDebug: isDebug}));
gulp.task('stylus-analysisDependency', stylus.analysisDependency);
gulp.task('stylus-watch', ['stylus-analysisDependency'], stylus.watch({isDebug: isDebug}));

// webpack
var webpack = tasks.Webpack.create(config.webpack);
gulp.task('webpack-compile', webpack.compile({isDebug: isDebug}));
gulp.task('webpack-watch', function() {
	gulp.watch(path.join(config.webpack.srcDir, '**/*.js'), ['webpack-compile']);
});

// sprite
gulp.task('sprite', tasks.Sprite(config.sprite));

// webserver
gulp.task('webserver', tasks.Webserver(config.webserver));

// aeromock
var aeromock = tasks.Aeromock.create(config.aeromock);
gulp.task('aeromock-linkIndex', aeromock.linkIndex);
gulp.task('aeromock-start', ['aeromock-linkIndex'], aeromock.start());
// gulpのプロセス終了時にaeromockのプロセスを終了させる
process.on('SIGINT', function() {
	aeromock.exit(function() {
		exit();
	});
});

// rsync
gulp.task('rsync', tasks.Rsync(config.rsync));

// freemarker
gulp.task('html', tasks.Freemarker.compile(config.freemarker));

// freemarker server
gulp.task('freemarker-server', tasks.FreemarkerServer(config.freemarkerServer, config.freemarker));

gulp.task('default', [
	'stylus-compile',
	'stylus-watch',
	'webpack-compile',
	'webpack-watch',
	'sprite',
	'webserver',
	'aeromock-start',
	'rsync',
	'html',
	'freemarker-server'
]);