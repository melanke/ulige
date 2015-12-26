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
		configurarNotification();

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
			"Filmes e Series": [],
			Viagem: [],
			"Música": [],
			Arte: [],
			"Coluna Discursiva": [],
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

///////////// LOCAL NOTIFICATION ///////////

	var isNotificationEnabled = false;

    var configurarNotification = function () {  
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register("localNotification.js")
                    .then(initnotificationState);
        }
    };

    var initnotificationState = function() {

        if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
            alert("Seu navegador não suporta notificações");
            return;
        }

        if (Notification.permission === 'denied') {
            alert("Você negou a permissão de enviar notificações");
            return;
        }

        if (!('PushManager' in window)) {
            alert("Seu navegador não suporta notificações");
            return;
        }

        navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {

            // serviceWorkerRegistration.pushManager.getSubscription()
            //         .then(function (subscription) {

            //             var notificationButton = $('#localnotification');
            //             notificationButton.prop("disabled", false);

            //             if (!subscription) {
            //                 return;
            //             }

            //             sendnotificationSubscriptionToServer(subscription);

            //             notificationButton.html('Disabilitar Notificações');
            //             isNotificationEnabled = true;
            //         })
            //         .catch(function (err) {
            //             $.message({
            //                 text: "Houve um erro, tente novamente mais tarde!",
            //                 class: "error",
            //                 timeout: 5000
            //             });
            //         });
        });

    };

    var subscribeNotification = function() {

        var notificationButton = $('#localnotification');
        notificationButton.prop("disabled", true);

        navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
            // serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true})
            //         .then(function (subscription) {

            //             isNotificationEnabled = true;
            //             notificationButton.html('Disabilitar Notificações');
            //             notificationButton.prop("disabled", false);

            //             return sendnotificationSubscriptionToServer(subscription);
            //         })
            //         .catch(function (e) {
            //             if (Notification.permission === 'denied') {
            //                 $.message({
            //                     text: "Você negou a permissão de enviar notificações",
            //                     class: "error",
            //                     timeout: 5000
            //                 });
            //                 notificationButton.prop("disabled", true);
            //             } else {
            //                 $.message({
            //                     text: "Houve um erro, tente novamente mais tarde!",
            //                     class: "error",
            //                     timeout: 5000
            //                 });
            //                 notificationButton.prop("disabled", false);
            //                 notificationButton.html('Habilitar Notificações');
            //             }
            //         });
        });
    };

    var unsubscribeNotification = function() {
        var notificationButton = $('#localnotification');
        notificationButton.prop("disabled", true);

        navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {

            // serviceWorkerRegistration.pushManager.getSubscription().then(
            //         function (pushSubscription) { 
            //             if (!pushSubscription) {
            //                 isNotificationEnabled = false;
            //                 notificationButton.prop("disabled", false);
            //                 notificationButton.html('Habilitar Notificações');
            //                 return;
            //             }

            //             var subscriptionId = pushSubscription.subscriptionId;

            //             pushSubscription.unsubscribe().then(function (successful) {
            //                 notificationButton.prop("disabled", false);
            //                 notificationButton.html('Habilitar Notificações');
            //                 isNotificationEnabled = false;
            //             }).catch(function (e) {
            //                 // We failed to unsubscribe, this can lead to  
            //                 // an unusual state, so may be best to remove
            //                 // the users data from your data store and
            //                 // inform the user that you have done so

            //                 $.message({
            //                     text: "Houve um erro, tente novamente mais tarde!",
            //                     class: "error",
            //                     timeout: 5000
            //                 });
            //                 notificationButton.prop("disabled", false);
            //                 notificationButton.html('Habilitar Notificações');
            //             });
            //         }).catch(function (e) {
            //     $.message({
            //         text: "Houve um erro, tente novamente mais tarde!",
            //         class: "error",
            //         timeout: 5000
            //     });
            // });
        });
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

        $(document).on("click", "#localnotification", function(){
            if (isNotificationEnabled) {
                unsubscribeNotification();
            } else {
                subscribeNotification();
            }
        });
    };

	init();

};