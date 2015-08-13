var yaml = require('./yaml');

function getAeromockUrlList(titles, items) {
	var list = [];
	if (typeof(titles) === 'string') {
		titles = [titles];
	}
	
	for (var i=0; i < items.length; i++) {
		var item = items[i];
		if (item.link) {
			list.push({
				title: titles.concat([item.title]),
				path: item.link
			});
		} else {
			list = list.concat(getAeromockUrlList(titles.concat([item.title]), item.items));
		}
	}
	
	return list;
}

module.exports = {
	parseAeromockLinks: function(filePath) {
		var data = yaml.load(filePath);
		return getAeromockUrlList(data.title, data.items);
	}
};