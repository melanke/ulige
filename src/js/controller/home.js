var $ = require("jquery"),
	URL = require("../const/url.js"),
	maisNovosTpl = require("../../tmpl/maisNovos.html"),
	categoriasTpl = require("../../tmpl/categorias.html"),
	liPostThumbnail = require("../../tmpl/liPostThumbnail.html"),
	defaultInterface = require("../service/defaultInterface.js"),
	postProcessor = require("../service/postProcessor.js"),
	simpleStorage = require("simpleStorage.js");

var Isotope = require("isotope-layout");

module.exports = function() {

	var maisNovos,
		categorias,
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
		categorias = {
			"Filmes e Séries": [],
			Viagem: [],
			"Música": [],
			Arte: [],
			"Discursiva": [],
			"Cozinha Ulige": [],
			"A Cerveja Vive": [],
			"Ulige Entrevista": [],
			Outros: []
		};

		for (var i in data.feed.entry) {
			var post = data.feed.entry[i];

			if (i < 4) {
				maisNovos.push(post);
			}

			var temCategoriaPrincipal = false;		

			for (var j in post.category) {

				var category = post.category[j];

				if (categorias[category.term]) {
					post.categoriaPrincipal = category.term;
					temCategoriaPrincipal = true;

					if (i >= 4) {
						categorias[category.term].push(post);
					}

					// com break os posts são de apenas uma categoria
					// break;
				}
			}

			if (!temCategoriaPrincipal && i >= 4) {
				categorias.Outros.push(post);
			}

			postProcessor.single(post);
		}

	};

	var loadCache = function()
	{
		maisNovos = simpleStorage.get("maisNovos");
		categorias = simpleStorage.get("categorias");
	};

	var registerCache = function()
	{
		//caches de 5 minutos

		simpleStorage.set("maisNovos", maisNovos, { TTL: 5 * 60 * 1000 });
		simpleStorage.set("categorias", categorias, { TTL: 5 * 60 * 1000 });
	};

///////////// RENDER /////////////

	var renderData = function()
	{
		if (dataRendered || !maisNovos || !categorias) {
			return;
		}

		$(".loading").remove();

		$("#main").append(maisNovosTpl({ posts: maisNovos }));

		categorias.liPostThumbnail = liPostThumbnail;

		try {
			$("#main").append(categoriasTpl(categorias));
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