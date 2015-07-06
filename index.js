/**
 * common-gulp
 */
exports.minimist = require('minimist');
exports.tasks = {
	Stylus: require('./tasks/stylus'),
	Webpack: require('./tasks/webpack'),
	Aeromock: require('./tasks/aeromock'),
	Sprite: require('./tasks/sprite'),
	Webserver: require('./tasks/webserver'),
	Rsync: require('./tasks/rsync'),
	Freemarker: require('./tasks/freemarker'),
	FreemarkerServer: require('./tasks/freemarker-server'),
	PhpServer: require('./tasks/php-server'),
	Concat: require('./tasks/concat'),
	Capture: require('./tasks/capture')
};
exports.libs = {
	CompileLog: require('./libs/compile-log'),
	NodePhp: require('./libs/node-php'),
	StylusDependency: require('./libs/stylus-dependency')
};