var connect = require('gulp-connect-php');
module.exports = function(config) {
	return function() {
		connect.server(config);
	};
};