var gulp = require('gulp');
var spritesmith = require('gulp.spritesmith');

module.exports = function(config, option) {
	option = option || {};
	return function() {
		var spriteData = gulp
			.src(config.srcDir + '*.*')
			.pipe(spritesmith(config.options));
		
		spriteData.img.pipe(gulp.dest(config.imgDestDir));
		spriteData.css.pipe(gulp.dest(config.cssDestDir));
	};
};