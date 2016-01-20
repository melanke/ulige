var $ = require("jquery"),
	URL = require("../const/url.js"),
	defaultTpl = require("../../tmpl/default.html"),
	liPostThumbnail = require("../../tmpl/liPostThumbnail.html"),
	postProcessor = require("../service/postProcessor.js");
    
module.exports =  function(){

	var posts;

	var init = function()
	{
		$("#body").html(defaultTpl());
		registerInteraction();
	};

	var buscar = function(query)
	{
		if (query.length) {
			$.get(URL.SEARCH(query), function(resp){
				
				if (resp.feed.entry) {

					posts = resp.feed.entry;
					processResultadoBusca();
					renderResultadoBusca();
				} else {

					$.get(URL.SEARCH(query.replace(/\w+[.!?]?$/, '')), function(resp){
						posts = resp.feed.entry;
						processResultadoBusca();
						renderResultadoBusca();
					});
				}

			});
		} else {
			posts = null;
			renderResultadoBusca();
		}
	};

	var processResultadoBusca = function()
	{
		if (posts) {
			for (var i in posts) {
				var p = posts[i];
				postProcessor.single(p);
			}
		}
	};

	var renderResultadoBusca = function()
	{
		var dropdownv = $("#search-dropdown")
		dropdownv.html("");

		if (posts) {
			for (var i in posts) {
				var p = posts[i];
				$("#search-dropdown").append(liPostThumbnail({ post: p }));
			}

			dropdownv.show();
		} else {
			dropdownv.hide();
		}
	};

	var registerInteraction = function()
	{
		var searchView = $("#header input");
		var search = function(){
			buscar($(this).val());
		};

		searchView.on('search', search);
		searchView.keyup(search);
	};

	init();
};