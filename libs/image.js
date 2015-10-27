var fs = require('fs');

module.exports = {
	image2base64: function(imagePath) {
		var data = fs.readFileSync(imagePath);
		return new Buffer(data, 'binary').toString('base64');
	}
};