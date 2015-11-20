var $ = require("jquery"),
	URL = require("../const/url.js"),
	tplPost = require("../../tmpl/post.html"),
	liPostThumbnail = require("../../tmpl/liPostThumbnail.html"),
	defaultInterface = require("../service/defaultInterface.js"),
	postProcessor = require("../service/postProcessor.js"),
	cacheHandler = require("../service/cacheHandler.js"),
	simpleStorage = require("simpleStorage.js"),
	moment = require("moment");

window.jQuery = $;
require("jssocials");

require("moment/locale/pt-br");
require("jquery.backstretch");

module.exports = function() {

	var post,
		visualizados,
		sugeridos;

	var init = function(){
		loadData();
		syncPostsVisualizados();
		defaultInterface();
		renderData();
		loadPostsSugeridos();
	};

	var loadData = function()
	{
		var dataV = $("#data-meta");
		
		post = {
			title: {
				$t: dataV.find("#title").html()
			},
			content: {
				$t: dataV.find("#body").html()
			},
			moment: moment(dataV.find("#timestampISO8601").html()),
			dateHeader: dataV.find("#dateHeader").html(),
			id: dataV.find("#id").html(),
			link: dataV.find("#link").html(),
			url: dataV.find("#url").html(),
			authorProfileUrl: dataV.find("#authorProfileUrl").html(),
			author: dataV.find("#author").html(),
			dummyTag: dataV.find("#dummyTag").html(),
			labels: []
		};

		dataV.find("#labels span").each(function(){
			post.labels.push($(this).html());
		});

		postProcessor.single(post);

		
	};

	var loadPostsSugeridos = function(){

		syncPostsVisualizados();

		var tagname = obterCategoriaPrincipal();

	    $.get(URL.TAG(tagname), function(resp){

	    	var posts = postProcessor.multi(resp);
	    	cacheHandler.setPostsDaTag(tagname, posts)
	    	
	    	sugeridos = [];

	    	for (var i in posts) {
	    		var p = posts[i];

	    		if (visualizados.indexOf(p.title.$t) < 0) {
	    			sugeridos.push(p);
	    		}
	    	}

	    	shuffle(sugeridos);
	    	renderPostsSugeridos();

	    });
	};

	var obterCategoriaPrincipal = function(){
		var categorias = [
			"Filmes e Series",
			"Viagem",
			"Música",
			"Arte",
			"Coluna Discursiva",
			"Cozinha Ulige",
			"A Cerveja Vive",
			"Ulige Entrevista",
			"Outros"
		];

		for (var j in post.labels) {

			var category = post.labels[j];

			if (categorias.indexOf(category) > -1) {
				return category;
			}
		}

		return post.labels[0];
	};

	var shuffle = function(array) {
		var currentIndex = array.length, temporaryValue, randomIndex ;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {
			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	};

	var syncPostsVisualizados = function()
	{
		visualizados = simpleStorage.get("visualizados") || [];
		
		if (visualizados.indexOf(post.title.$t) < 0) {
			visualizados.push(post.title.$t);
		}

		simpleStorage.set("visualizados", visualizados);
	};

///////////// RENDER /////////////

	var renderData = function()
	{
		$("#main").html(tplPost({ post: post }));
		
		if (post.cover && post.cover.length) {
			$("#cover").backstretch(post.cover);
		}

		initComentarios();
		initShare();
	};

	var renderPostsSugeridos = function()
	{
		var maxH = $("#content").outerHeight();
		var relacionadosV = $("#relacionados");
		var continuaRelacionadosV = $("#outrosPosts .wrapper");

		if (sugeridos && sugeridos.length) {

			var continuacao = -1;
			for (var i in sugeridos) {

				if (continuacao == -1) {

					if (relacionadosV.outerHeight() <= maxH && relacionadosV.is(":visible")) {
						relacionadosV.append(liPostThumbnail({post: sugeridos[i]}));
					} else {
						relacionadosV.find("div:last-child").remove();
						continuacao = 0;
					}
				} 

				if (continuacao != -1) {

					if (continuacao < 3) {
						$("#outrosPosts").show();
						continuaRelacionadosV.append(liPostThumbnail({post: sugeridos[i]}));
						continuacao++;
					} else {
						break;
					}
				}
			}
		} else {
			relacionadosV.hide();
		}
	};

	var initComentarios = function()
	{
		var d = document,
			s = "script",
			id = "facebook-jssdk";

		var js, fjs = d.getElementsByTagName(s)[0];

		if (d.getElementById(id)) {
			return;
		}

		js = d.createElement(s); 
		js.id = id;
		js.src = "//connect.facebook.net/pt_BR/sdk.js#xfbml=1&version=v2.5&appId=1776817549211710";
		fjs.parentNode.insertBefore(js, fjs);
	};

	var initShare = function()
	{
		$("#share").jsSocials({
		    url: post.url,
		    text: post.title.$t,
		    showCount: true,
		    showLabel: false,
		    shares: [
		        { share: "twitter", via: "blogulige" },
		        "facebook",
		        "googleplus",
		        "pinterest"
		    ]
		});
	};

	init();

};