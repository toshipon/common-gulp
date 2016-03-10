var compileTemplate = require('../libs/compile-template');
var ejs = require('gulp-ejs');
var util = require('./util');

module.exports = {
	create: function(config) {
		var Template = compileTemplate.load('ejs', ejs, 'ejs', 'html');
		return util.createTasks(new Template(config));
	}
};