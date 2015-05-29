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
	FreemarkerServer: require('./tasks/freemarker-server')
};