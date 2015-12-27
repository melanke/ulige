(function(){

	var $ = require("jquery"),
	    URL = require("../const/url.js"),
	    simpleStorage = require("simpleStorage.js");

	window.cb = function(data){
	    console.log(data);
	};

	self.importScripts('https://melanke-test.blogspot.com.br/feeds/posts/default/?alt=json&max-results=10&callback=cb');

	setInterval(function(){
		self.registration.showNotification("Novo post", {  
	      body: "Na categoria \"Entretenimento\"",  
	      icon: "https://cdn.rawgit.com/melanke/ulige/master/imgs/logo.png"
	    });
	}, 5 * 60 * 1000);

})();