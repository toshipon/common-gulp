'use strict';

var path = require('path');
var fs = require('fs');
var util = require('util');
var _ = require('lodash');
var glob = require('glob');
var gutil = require('gulp-util');

var StylusDependency = (function() {
	var ENCODINGS = ['utf-8', 'euc-jp', 'shift-jis'];
	var STYLUS_EXT = '.styl';
	
	/**
	 * @constructor
	 * @param options
	 */
	function StylusDependency() {
		this.dependents = {};
	}
	
	var cls = StylusDependency.prototype;
	
	/**
	 * @static
	 * @param path
	 * @returns {{body: *, encoding: *}}
	 */
	function getContent(path) {
		var body = null;
		var enc;
		for (var i=0; i < ENCODINGS.length; i++) {
			enc = ENCODINGS[i];
			try {
				body = fs.readFileSync(path, enc);
				break;
			} catch(e) {
				break;
			}
		}
		return {body: body, encoding: enc};
	}

	/**
	 * ファイルパスにStylusの拡張子を追加
	 * @static
	 * @param filePath
	 * @returns {*}
	 */
	function addExt(filePath) {
		var regex = new RegExp(util.format('\\%s$', STYLUS_EXT));
		if (!filePath.match(regex)) {
			filePath += STYLUS_EXT;
		}
		return filePath;
	}
	
	/**
	 * @private
	 * @param target
	 * @param dependent
	 */
	cls.depend = function(target, dependent) {
		if (!dependent || dependent.length === 0) {
			return;
		}
		
		var list = this.dependents[target] || [];
		this.dependents[target] = _.uniq(list.concat(dependent));
	};
	
	/**
	 * ソース中のimport記述を元にimportされているファイルを解析
	 * @public
	 * @param srcFilePath 対象のStylusファイル
	 * @param stylusOptions Stylusのコンパイルオプション。現状はdefine値取得のために使用。
	 * @returns {boolean}
	 */
	cls.parseImports = function(srcFilePath, stylusOptions) {
		var self = this;
		
		// 拡張子の追加
		srcFilePath = addExt(srcFilePath);
		
		// minimatch形式のパスに対応
		var globFiles = glob.sync(srcFilePath);
		if (globFiles.length === 0) {
			gutil.log('Can not be read file:\n\t' + gutil.colors.magenta(srcFilePath));
			return false;
		}
		if (globFiles.length > 1) {
			for (var i=0; i < globFiles.length; i++) {
				self.parseImports(globFiles[i], stylusOptions);
			}
			return false;
		}
		
		var body = getContent(srcFilePath).body;
		if (body === null) {
			gutil.log('Can not be read file:\n\t' + gutil.colors.magenta(srcFilePath));
			return false;
		}
		
		var imports = [];
		var define = stylusOptions.define;
		
		body.replace(/@import[\s]+([a-zA-Z\-_]*)[\s\+]*("|')(.+?)("|')/g, function(str, varName, str2, importFilePath) {
			var importFile;
			
			// nibの場合はスルー
			if (importFilePath === 'nib') {
				return;
			}
			
			var dirPath = path.dirname(srcFilePath);
			if (varName && define && define[varName]) {
				importFile = path.join(dirPath, define[varName] + importFilePath);
			} else {
				importFile = path.join(dirPath, importFilePath);
			}
			
			// 拡張子の追加
			importFile = addExt(importFile);
			
			// さらに再帰的に依存関係を解析
			self.parseImports(importFile, stylusOptions);
			
			imports.push(importFile);
		});
		
		this.depend(srcFilePath, imports);
		
		return (imports.length > 0);
	};
	
	/**
	 * 依存情報の取得
	 * @public
	 * @param {String} path
	 * @returns {Array}
	 */
	cls.getDependents = function(path) {
		if (arguments.length === 0) {
			return this.dependents;
		}
		
		if (this.dependents[path]) {
			return this.dependents[path].reduce(function(r, f) {
				return r.concat(this.getDependents(f));
			}.bind(this), [path]);
		} else {
			return [path];
		}
	};
	
	/**
	 * 指定したファイルをimportしているファイルを取得
	 * @public
	 * @param targetImportFile
	 * @returns {Array}
	 */
	cls.getDependentParents = function(targetImportFile) {
		var self = this;
		var depParents = [];
		
		// targetImportFileがimportされているファイルを探す
		_.forEach(this.dependents, function(depFiles, parentFile) {
			if (depFiles.indexOf(targetImportFile) === -1) {
				return;
			}
			
			// 再帰的に探す（多重import対応）
			depParents = depParents.concat(self.getDependentParents(parentFile));
			depParents.push(parentFile);
		});
		
		return depParents;
	};
	
	return StylusDependency;
})();

module.exports = StylusDependency;