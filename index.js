/**
 * common-gulp
 */
exports.minimist = require('minimist');
exports.runSequence = require('run-sequence');
exports.tasks = {
	Stylus: require('./tasks/stylus'),
	Webpack: require('./tasks/webpack'),
	EJS: require('./tasks/ejs'),
	Aeromock: require('./tasks/aeromock'),
	Sprite: require('./tasks/sprite'),
	Webserver: require('./tasks/webserver'),
	Rsync: require('./tasks/rsync'),
	Freemarker: require('./tasks/freemarker'),
	FreemarkerServer: require('./tasks/freemarker-server'),
	PhpServer: require('./tasks/php-server'),
	PhpRender: require('./tasks/php-render'),
	Concat: require('./tasks/concat'),
	Capture: require('./tasks/capture')
};
exports.libs = {
	CompileLog: require('./libs/compile-log'),
	NodePhp: require('./libs/node-php'),
	StylusDependency: require('./libs/stylus-dependency'),
	Yaml: require('./libs/yaml'),
	Capture: require('./libs/capture'),
	Freemarker: require('./libs/freemarker'),
	Image: require('./libs/image')
};