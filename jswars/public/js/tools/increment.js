module.exports = function () { 

	var id = 0; 

	return {

		id: function () {

			id += 1; return id;
		}
	};
}();