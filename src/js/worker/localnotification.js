(function(){

	var localforage = require("localforage"),
		moment = require("moment");

	var categoriasQueSigo,
		horaUltimaNotificacao,
		urlNotificacao;

	var init = function()
	{
		registerInteraction();

		localforage.getItem("categoriasQueSigo", function(er, valueC) {
            categoriasQueSigo = valueC || [];

            localforage.getItem("horaUltimaNotificacao", function(er, valueH){
            	horaUltimaNotificacao = valueH;

				if (horaUltimaNotificacao) {
					horaUltimaNotificacao = moment(horaUltimaNotificacao);
				} else {
					horaUltimaNotificacao = moment();
					localforage.setItem("horaUltimaNotificacao", horaUltimaNotificacao.format());
				}

				initLoop();
            }); 
        });
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

					if (categoriasQueSigo.indexOf(category.term) > -1) {
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
		localforage.setItem("horaUltimaNotificacao", horaUltimaNotificacao.format());

		for (var j in post.link) {
         	if (post.link[j].rel === "alternate") {
                urlNotificacao = post.link[j].href;
                break;
            }
        }

		showNotification(post.title.$t, "Novo post em \""+categoria+"\"");
	};

	var showNotification = function(titulo, descricao) {
		self.registration.showNotification(titulo, {  
	      body: descricao,  
	      icon: "http://melanke.github.io/ulige/imgs/logo.png"
	    });
	};

	var notificationClicked = function(event) {
		event.notification.close();

		if (!urlNotificacao) {
			return;
		}

		//verifica se a pagina já está aberta para focar nela ou abrir uma nova
		event.waitUntil(
			clients.matchAll({  
			  type: "window"  
			}).then(function(clientList) {
				
			  for (var i = 0; i < clientList.length; i++) {  
			    var client = clientList[i];  

			    if (client.url.indexOf(urlNotificacao) > -1 && 'focus' in client)  
			      return client.focus();  
			    } 

			    if (clients.openWindow) {
			      return clients.openWindow(urlNotificacao);  
			    }
			})
		);
	};

	var initLoop = function()
	{
		//a cada 5 minutos
		setInterval(checkNewPosts, 5 * 60 * 1000);
	};

	var registerInteraction = function()
	{
		self.addEventListener('notificationclick', function(event) {  
			notificationClicked(event);
		});
	};

	init();

})();