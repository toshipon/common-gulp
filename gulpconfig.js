module.exports = {
	stylus: {
		sp: {
			srcDir: './template/stylus/',
			destDir: './dest/css/',
			useNib: true,
			options: {
				define: {
					'sprite-version': '201409020000'
				},
				compress: true
			},
			autoprefix: true,
			autoprefixer: {
				// autoprefixer option
				options: {
					browsers: [
						'ios >= 6',
						'android >= 2'
					]
				}
			}
		}
	},
	webpack: {
		sp: {
			srcDir: './template/js/',
			destDir: './dest/js/',
			compress: true,
			options: {
				
			},
			// uglify output option
			uglify: {
				output: {
					ascii_only: true
				}
			}
		}
	},
	sprite: {
		srcDir: './template/img/sprite/',
		imgDestDir: './dest/img/',
		cssDestDir: './template/stylus/',
		options: {
			cssFormat: 'stylus',
			algorithm : 'left-right',
			padding: 2,
			imgName: 'sprite.png',
			cssName: 'imports/_sprite.styl',
			imgPath: '../img/sprite.png' // css内でのsprite.png指定時のパス
		}
	},
	webserver: {
		rootDir: './dest/',
		port: 3000
	},
	aeromock: {
		dir: './aeromock/',
		execOptions: ['-c', './aeromock/config.yaml']
	},
	rsync: {
		username: 'user',
		hostname: 'hostname',
		rootDir: './js/',
		destination: '/usr/local/app/pub/js/'
	},
	freemarker: {
		// 出力するページや変数の設定ファイル
		configFile: './src/freemarker/config.yml',
		srcDir: './src/freemarker/',
		destDir: './public/'
	},
	freemarkerServer: {
		rootDir: './public',
		options: {
			directoryListing: false,
			port: 3000
		},
		// rootDirからのパス
		watchDirs: [
			'modules/',
			'helpers/',
			'bower_components/freemarker-libs/'
		]
	},
	phpServer: {
		rootDir: './public/',
		router: 'index.php',
		options: {
			port: 3000
		}
	},
	phpRender: {
		configFile: './src/freemarker/config.yml',
		srcDir: './src/freemarker/',
		destDir: './public/',
		compress: true,
		htmlmin: {
			options: {
				collapseWhitespace: true
			}
		}
	},
	concat: {
		'sp-vendor': {
			src: [
				'./src/bower_components/jquery-modern/dist/jquery.min.js',
				'./src/bower_components/lodash/lodash.min.js',
				'./src/bower_components/d3/d3.min.js'
			],
			destDir: './public/sp/js/',
			destName: 'vendor.js'
		}
	},
	bower: {
		rootDir: './src/',
		directory: 'bower_components'
	}
};