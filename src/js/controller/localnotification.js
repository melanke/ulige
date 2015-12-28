(function() {

    var $ = require("jquery"),
        localforage = require("localforage");

    var categoriasQueSigo;

    var init = function()
    {
        popularFormulario();
        configurarNotification();
        registerInteraction();
    };

    var popularFormulario = function()
    {
        localforage.getItem("categoriasQueSigo", function(er, value) {
            categoriasQueSigo = value || [];
            renderFormulario();
        });
    };

    var configurarNotification = function () {  
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register("localnotification-worker.js")
                    .then(initnotificationState);
        }
    };

    var initnotificationState = function() {

        if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
            alert("Seu navegador não suporta notificações");
            return;
        }

        if (!("Notification" in window)) {
            alert("Seu navegador não suporta notificações");

        } else if (Notification.permission !== "granted" && Notification.permission !== 'denied') {
            Notification.requestPermission(function (permission) {
                navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {

                });
            });
        }

    };

    var subscribeNotification = function() {

        $("input[type=checkbox]:checked").each(function(){
            var label = $(this).data("label");

            if (categoriasQueSigo.indexOf(label) < 0) {
                categoriasQueSigo.push(label);
            }
        });

        localforage.setItem("categoriasQueSigo", categoriasQueSigo, function() {
            navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {

            });
        });
    };

//////////////////////// RENDER ///////////////////

    var renderFormulario = function()
    {
        $("input[type=checkbox]").each(function(){
            var el = $(this);
            var label = el.data("label");

            if (categoriasQueSigo.indexOf(label) > -1) {
                el.prop("checked", true);
            }
        });
    };

    var registerInteraction = function()
    {
        $("form").submit(function(){
            subscribeNotification();

            return false;
        });
    };

    init();

})();