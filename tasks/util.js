exports.createTasks = function(instance) {
	var tasks = {};
	for (var name in instance) {
		if (typeof(instance[name]) === 'function') {
			tasks[name] = instance[name].bind(instance);
		}
	}
	return tasks;
};
