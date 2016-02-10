var $ = require("jquery"),
	URL = require("../const/url.js"),
	categorias = require("../const/categorias.js"),
	categoriasHome = require("../const/categoriasHome.js"),
	maisNovosTpl = require("../../tmpl/maisNovos.html"),
	liCategoriaHomeTpl = require("../../tmpl/liCategoriaHome.html"),
	liPostThumbnail = require("../../tmpl/liPostThumbnail.html"),
	defaultInterface = require("../service/defaultInterface.js"),
	postProcessor = require("../service/postProcessor.js"),
	simpleStorage = require("simpleStorage.js");

var Isotope = require("isotope-layout");

module.exports = function() {

	var maisNovos,
		categoriasComUltimosPosts,
		dataRendered = false,
		maisNovosInterval,
        maisNovosTimeout;

	var init = function(){
		defaultInterface();
		registerInteraction();

		loadCache();
		renderData();

	    $.get(URL.HOME, function(resp){

	    	processData(resp);
	    	registerCache();
	    	renderData();

	    });
	};

	var processData = function(data) {

		maisNovos = [];

		categoriasComUltimosPosts = {};

		//separa as categorias em formato de mapa de array
		for (var i in categorias) {
			categoriasComUltimosPosts[categorias[i]] = [];
		};

		for (var i in data.feed.entry) {
			var post = data.feed.entry[i];

			if (i < 4) {
				maisNovos.push(post);
			}

			var temCategoriaPrincipal = false;		

			for (var j in post.category) {

				var category = post.category[j];

				if (categoriasComUltimosPosts[category.term]) {
					post.categoriaPrincipal = category.term;
					temCategoriaPrincipal = true;

					if (i >= 4) {
						categoriasComUltimosPosts[category.term].push(post);
					}

					// com break os posts são de apenas uma categoria
					// break;
				}
			}

			if (!temCategoriaPrincipal && i >= 4) {
				categoriasComUltimosPosts.Outros.push(post);
			}

			postProcessor.single(post);
		}

	};

	var loadCache = function()
	{
		maisNovos = simpleStorage.get("maisNovos");
		categoriasComUltimosPosts = simpleStorage.get("categorias");
	};

	var registerCache = function()
	{
		//caches de 5 minutos

		simpleStorage.set("maisNovos", maisNovos, { TTL: 5 * 60 * 1000 });
		simpleStorage.set("categorias", categoriasComUltimosPosts, { TTL: 5 * 60 * 1000 });
	};

///////////// RENDER /////////////

	var renderData = function()
	{
		if (dataRendered || !maisNovos || !categoriasComUltimosPosts) {
			return;
		}

		$(".loading").remove();

		$("#main").append(maisNovosTpl({ posts: maisNovos }));

		$("#main").append("<div id='categorias'></div>");

		try {
			for (var i in categoriasHome) {
				$("#categorias").append(liCategoriaHomeTpl({
					nome: i,
					config: categoriasHome[i],
					post1: liPostThumbnail({ post: categoriasComUltimosPosts[i][0] }),
					post2: liPostThumbnail({ post: categoriasComUltimosPosts[i][1] })
				}));
			}
		} catch (e) {}

		initMaisNovosAnimation();

		new Isotope('#categorias', {
			itemSelector: '.section'
		});

		dataRendered = true;
	};

	var initMaisNovosAnimation = function()
	{
        maisNovosInterval = setInterval(function(){
            andarMaisNovoDireita();
        }, 5000);
    };

    var pausarAnimation = function()
    {
    	if (maisNovosInterval) {
    		clearTimeout(maisNovosInterval);
    	}

    	if (maisNovosTimeout) {
    		clearTimeout(maisNovosTimeout);
    	}

    	maisNovosTimeout = setTimeout(function() {
    		initMaisNovosAnimation();
    	}, 5000);
    };

    var andarMaisNovoDireita = function()
    {
		var item = $("#maisNovos .liMaisNovo:first");

    	$("#maisNovos").animate({
            "margin-left": item.width() * -1
        }, 500, function(){
        	item.remove().insertAfter($("#maisNovos .liMaisNovo:last"));
        	$("#maisNovos").css({
        		"margin-left": 0
        	});
        });
    };

    var andarMaisNovoEsquerda = function()
    {
    	var item = $("#maisNovos .liMaisNovo:last");

    	$("#maisNovos").css({
    		"margin-left": item.width() * -1
    	});
    	item.remove().insertBefore($("#maisNovos .liMaisNovo:first"));

    	$("#maisNovos").animate({
            "margin-left": 0
        });
    };
    
    var registerInteraction = function() {
        $(document).on("click", "#maisNovos-esquerda", function(){
        	pausarAnimation();
        	andarMaisNovoEsquerda();
        });

        $(document).on("click", "#maisNovos-direita", function(){
        	pausarAnimation();
        	andarMaisNovoDireita();
        });
    };

	init();

};