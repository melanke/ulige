var $ = require("jquery"),
	URL = require("../const/url.js"),
	categorias = require("../const/categorias.js"),
	liPostThumbnail = require("../../tmpl/liPostThumbnailBig.html"),
	defaultInterface = require("../service/defaultInterface.js"),
	postProcessor = require("../service/postProcessor.js"),
	cacheHandler = require("../service/cacheHandler.js");

module.exports = function(tagname) {

	var postsDaTag,
		dataRendered = false;

	var init = function(){
		defaultInterface();

		if (tagname === "Variedades") {
			carregarOutros();
		} else {
			carregarPostsDaTag();
		}
	};

	var carregarPostsDaTag = function() {

		postsDaTag = cacheHandler.getPostsDaTag(tagname);
		renderData();

	    $.get(URL.TAG(tagname), function(resp){

	    	postsDaTag = postProcessor.multi(resp);
	    	cacheHandler.setPostsDaTag(tagname, postsDaTag);
	    	renderData();

	    });

	};

	var carregarOutros = function() {
		$.get(URL.HOME, function(resp){

	    	processOutros(resp);
	    	renderData();

	    });
	};

	var processOutros = function(data) {
		postsDaTag = [];

		for (var i in data.feed.entry) {
			var post = data.feed.entry[i];

			var categoriaP = obterCategoriaPrincipal(post);

			if (categoriaP == null) {
				postProcessor.single(post);
				postsDaTag.push(post);
			}
		}
	};

	var obterCategoriaPrincipal = function(post){
		for (var j in post.category) {

			var category = post.category[j].term;

			if (category !== "Variedades" && categorias.indexOf(category) > -1) {
				return category;
			}
		}

		return null;
	};

	var renderData = function()
	{
		if (dataRendered || !postsDaTag) {
			return;
		}

		$(".loading").remove();

		$("#main").append("<div class='wrapper'></div>");

		var wrapper = $("#main .wrapper");

		wrapper.append("<h1>" + tagname + "</h1>");

		for (var i in postsDaTag) {
			wrapper.append(liPostThumbnail({post: postsDaTag[i]}));
		}

		wrapper.append("<div class='clear'></div>");

		dataRendered = true;
	};

	init();

};