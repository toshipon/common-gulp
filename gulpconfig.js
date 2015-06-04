module.exports = {
	stylus: {
		srcDir: './template/stylus/',
		destDir: './dest/css/',
		useNib: true,
		options: {
			define: {
				'sprite-version': '201409020000'
			},
			compress: true
		},
		autoprefixer: {
			option: {
				browsers: [
					'ios >= 6',
					'android >= 2.3'
				]
			}
		}
	},
	webpack: {
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
	},
	sprite: {
		srcDir: './template/img/sprite/',
		imgDestDir: './dest/img/',
		cssDestDir: './template/stylus/',
		option: {
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
		dir: './aeromock/'
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
		}
	},
	phpServer: {
		hostname: 'localhost',
		port: 3000,
		base: './public/',
		router: 'index.php'
	},
	phpRender: {
		configFile: './src/freemarker/config.yml',
		srcDir: './src/freemarker/',
		destDir: './public/'
	}
};