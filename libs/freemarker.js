var Freemarker = require('freemarker.js');
var path = require('path');

module.exports = {
	/**
	 * @param {Object} config
	 * @param {String} config.viewDir
	 * @param {String} config.viewPath
	 * @param {Object} config.data
	 * @param {Function} callback
	 */
	getCompileOutput: function(config, callback) {
		var Fm = new Freemarker({
			viewRoot: path.join(process.cwd(), config.viewDir),
			options: {}
		});
		Fm.render(config.viewPath, config.data, function(err, out, msg) {
			if (err) {
				console.log(err);
			}
			callback(out || msg);
		});
	}
};