var yaml = require('js-yaml');
var fs = require('fs');

module.exports = {
	load: function(path, code) {
		code = code || 'utf8';
		return yaml.safeLoad(fs.readFileSync(path, code));
	}
};