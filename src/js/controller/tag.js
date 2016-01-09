var $ = require("jquery"),
	URL = require("../const/url.js"),
	liPostThumbnail = require("../../tmpl/liPostThumbnailBig.html"),
	defaultInterface = require("../service/defaultInterface.js"),
	postProcessor = require("../service/postProcessor.js"),
	cacheHandler = require("../service/cacheHandler.js");

module.exports = function(tagname) {

	var postsDaTag,
		dataRendered = false;

	var init = function(){
		defaultInterface();

		postsDaTag = cacheHandler.getPostsDaTag(tagname);
		renderData();

	    $.get(URL.TAG(tagname), function(resp){

	    	postsDaTag = postProcessor.multi(resp);
	    	cacheHandler.setPostsDaTag(tagname, postsDaTag);
	    	renderData();

	    });
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