(function(){

	var simpleStorage = require("simpleStorage.js"),
		moment = require("moment");

	var categoriasQueSigo,
		horaUltimaNotificacao;

	var init = function()
	{
		categoriasQueSigo = simpleStorage.get("categoriasQueSigo") || [];
		horaUltimaNotificacao = simpleStorage.get("horaUltimaNotificacao");

		if (horaUltimaNotificacao) {
			horaUltimaNotificacao = moment(horaUltimaNotificacao);
		}

		initLoop();
	};

	var checkNewPosts = function() {
		importScripts('https://melanke-test.blogspot.com.br/feeds/posts/default/?alt=json&max-results=10&callback=cb');
	};

	self.cb = function(data){
	    
		for (var i in data.feed.entry) {
			var post = data.feed.entry[i];	

			if (!horaUltimaNotificacao || horaUltimaNotificacao.isBefore(post.published.$t)) {

				for (var j in post.category) {
					var category = post.category[j];

					if (categoriasQueSigo.indexOf(category.term)) {
						existeNova(post, category.term);
						break; //uma notificação por vez
					}
				}

			}
		}

	};

	var existeNova = function(post, categoria)
	{
		horaUltimaNotificacao = moment();
		simpleStorage.set("horaUltimaNotificacao", horaUltimaNotificacao.format());

		showNotification(post.title.$t, "Novo post em \""+categoria+"\"");
	};

	var showNotification = function(titulo, descricao) {
		self.registration.showNotification(titulo, {  
	      body: descricao,  
	      icon: "https://cdn.rawgit.com/melanke/ulige/master/imgs/logo.png"
	    });
	};

	var initLoop = function()
	{
		//a cada 5 minutos
		//setInterval(checkNewPosts, 5 * 60 * 1000);
		checkNewPosts();
	};

	init();

})();