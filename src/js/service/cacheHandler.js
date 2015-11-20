var $ = require("jquery"),
	simpleStorage = require("simpleStorage.js");
    
module.exports = {
	getPostsDaTag: function(tagname)
	{
		var categorias = simpleStorage.get("categorias");
		if (categorias) {
			postsDaTag = categorias[tagname];
		}

		return postsDaTag;
	},

	setPostsDaTag: function(tagname, postsDaTag)
	{
		var categorias = simpleStorage.get("categorias");

		if (!categorias) {
			categorias = {};
		}

		categorias[tagname] = postsDaTag;

		simpleStorage.set("categorias", categorias, { TTL: 5 * 60 * 1000 });
	}
};