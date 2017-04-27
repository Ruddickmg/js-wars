Row = function (name, data, type) {
	
	var d, len = data.length;

	this.row = document.createElement("tr");
  	this.row.setAttribute("id", name);
	this.data = [];

	for (var i = 0; i < len; i += 1) {
		if ((d = this.field(data[i], type))) {
			this.row.appendChild(d);
			this.data.push(d);
		}
	}
};
Row.prototype.field = function (value, type) {
	var element = document.createElement(type || "td");
	if (value || !isNaN(value)) element.innerHTML = value;
	return element;
};

module.exports = Row;