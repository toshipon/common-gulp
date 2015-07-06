exports.createTasks = function(instance) {
	var tasks = {};
	for (var name in instance) {
		if (typeof(instance[name]) === 'function') {
			tasks[name] = instance[name].bind(instance);
		}
	}
	return tasks;
};

/**
 * Combined digit
 * @param {Number|String} num
 * @param {Number} digitNum - Number of digits
 */
exports.digit = function(num, digitNum) {
	num = String(num);

	if (num.length >= digitNum) {
		return num;
	}

	var length = digitNum - num.length;
	for (var i=0; i < length; i++) {
		num = '0' + num;
	}

	return num;
}