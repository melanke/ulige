var $ = require("jquery"),
	simpleStorage = require("simpleStorage.js"),
	URL = require("../const/url.js"),
	categorias = require("../const/categorias.js"),
	defaultTpl = require("../../tmpl/default.html"),
	liPostThumbnail = require("../../tmpl/liPostThumbnail.html"),
	postProcessor = require("../service/postProcessor.js"),
	analytics = require("./analytics")();
    
module.exports =  function(){

	var posts;

	var init = function()
	{
		$("#body").html(defaultTpl({
			categorias: categorias
		}));

		guardarUsuario();
		registerInteraction();
	};

	var buscar = function(query)
	{
		if (query.length > 2) {

			analytics.busca(query);

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

	var guardarUsuario = function() {
		window.token = simpleStorage.get("token");

		if (!window.token) {
			window.token = gerarToken();
			simpleStorage.set("token", window.token);
		}

		analytics.acesso(geoplugin_countryCode(), window.token);
	};

	var gerarToken = function() {
	    var text = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	    for( var i=0; i < 5; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));

	    return text;
	}

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