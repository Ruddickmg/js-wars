Row = require("./row.js");

Table = function(name, items, rows) {

    var row, element = document.createElement("table");
    var headings, length = items.length;
    var rows = rows || Object.keys(items);

    title = document.createElement("caption");
    title.innerHTML = name;

    element.setAttribute("id", name+"Table");
    element.appendChild(title);
    element.appendChild(headings = new Row(name, rows, "th").row);

    this.elements = items.map(function (item) {
        element.appendChild((row = new Row("player" + item.player + name, rows.map(function (column) { 
        	return item[column.toLowerCase()]; 
        })).row));
        return row;
    });

    this.name = name;
    this.parameters = rows;
    this.element = element;
    this.title = title;
    this.columns = new UList(headings);
    this.sort = new Sort(items);
    this.rows = new UList(element).setElements(this.elements);
};
Table.prototype.sortBy = function (parameter) {
    this.setElements(this.sort.by(parameter).max().heap());
};
Table.prototype.setElements = function(list, bool) {

    var table = this.element, elements = table.childNodes; 
    var l = elements.length - 2, name = this.name, scope = this;
    var index = this.rows.index();

    while (l--) table.removeChild(table.lastChild);

    return this.rows.setElements(list.map(function (row) {
        table.appendChild((newRow = new Row("player"+row.player+name, scope.parameters.map(function (column) { 
            return row[column.toLowerCase()];
        })).row));
        return newRow;
    })).setIndex(index);
};

module.exports = Table;