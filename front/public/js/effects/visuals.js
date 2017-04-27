/* -------------------------------------------------------------------------------------- *\
	
	Visuals controls the visuals that will be displayed, selectable via the options menu

\* -------------------------------------------------------------------------------------- */

module.exports = function () {

	var element = document.createElement("ul");

	var options = ['a','b','c',"none"].map(function (option) {

		var item = document.createElement("li");
		item.innerHTML = option;
		element.appendChild(item);
	});

	var list = new List(["A","B","C","None"]);

	var descriptions = {

		none: "No visuals.",
		a: "View battle and capture animations.",
		b: "Only view battle animations.",
		c: "Only view player battle animations."
	};

	var describe = function (d) {

		console.log("describe: "+d);
	};

	return {

		element: function () { 

			return element 
		},

		options: function () { 

			return options 
		},

		select: function () { 

			list.next(); 
		},

		set: function (d) {

			describe(descriptions[d]); 
		}
	};
};

// category theory for compuer scientists