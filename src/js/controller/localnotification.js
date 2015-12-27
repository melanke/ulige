(function() {

    var $ = require("jquery"),
        simpleStorage = require("simpleStorage.js");

    var isNotificationEnabled = false;

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

        // Let's check if the browser supports notifications
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

        navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {

        });
    };

    configurarNotification();
    subscribeNotification();

})();