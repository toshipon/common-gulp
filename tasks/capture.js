var gulp = require('gulp');
var through = require("through2");
var path = require('path');
var Nightmare = require('nightmare');
var gutil = require('gulp-util');
var async = require('async');
var util = require('./util');
var rimraf = require('rimraf');
var fs = require('fs');

const USER_AGENT = {
	ios8: 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_2 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12D508 Safari/600.1.4',
	ios7: 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_1_2 like Mac OS X) AppleWebKit/537.51.2 (KHTML, like Gecko) Version/7.0 Mobile/11D257 Safari/9537.53',
	ios6: 'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X; ja-jp) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25',
	android4: 'Mozilla/5.0 (Linux; Android 4.1.1; Nexus 7 Build/JRO03S) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Safari/535.19',
	'android2.3': 'Mozilla/5.0 (Linux; U; Android 2.3.5; ja-jp; T-01D Build/F0001) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
	chrome: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.130 Safari/537.36',
	ie11: 'Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; Touch; rv:11.0) like Gecko',
	ie10: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)',
	ie9: 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
	ie8: 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0)'
};

module.exports = function(config, option) {
	option = option || {};
	
	if (!config.viewport) {
		config.viewport = {
			width: 320,
			height: 480
		};
	}
	
	return function(done) {
		var nightmare = new Nightmare();
		var timestamp = (new Date()).getTime().toString();
		var html = fs.readFileSync(path.join(__dirname, '../templates/capture_index.html'));
		
		var urlInfoList = config.urlList.map(function(urlInfo) {
			urlInfo.url = path.join(config.baseUrl, urlInfo.path);
			return urlInfo;
		});
		
		rimraf(config.destDir, function() {
			var cnt = 0;
			async.eachSeries(urlInfoList, function(urlInfo, next) {
				cnt++;
				urlInfo.fileName = (new Date()).getTime().toString();
				
				if (config.useragent && (config.useragent in USER_AGENT)) {
					nightmare.useragent(USER_AGENT[config.useragent]);
				}
				if (config.wait) {
					nightmare.wait(config.wait);
				}
				
				var imagePath = path.join(config.destDir, timestamp, urlInfo.fileName + '.png');
				nightmare
					.viewport(config.viewport.width, config.viewport.height)
					.goto(urlInfo.url)
					.screenshot(imagePath)
					.run(function(err) {
						if (err) {
							gutil.log(gutil.colors.red('[ERROR] capture', JSON.stringify(err, null, 2)));
						}
						gutil.log('[INFO] Captured', urlInfo.url, '=>', imagePath);
						next();
					});
			}, function() {
				var json = 'window.captureInfoList=' + JSON.stringify(urlInfoList) + ';window.pathVersion=' + timestamp;
				fs.writeFileSync(path.join(config.destDir, 'captureInfoList.js'), json);
				var html = fs.readFileSync(path.join(__dirname, '../templates/capture_index.html'));
				fs.writeFileSync(path.join(config.destDir, 'index.html'), html);
				done();
				//process.exit(0);
			});
		});
	};
};
