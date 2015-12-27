(function(){

	var $ = require("jquery"),
	    URL = require("../const/url.js"),
	    simpleStorage = require("simpleStorage.js");

	fetch("http://melanke-test.blogspot.com.br/feeds/posts/default/?alt=json&max-results=10").then(function(resp){
		console.log(resp);
	});

	setInterval(function(){
		self.registration.showNotification("Novo post", {  
	      body: "Na categoria \"Entretenimento\"",  
	      icon: "https://cdn.rawgit.com/melanke/ulige/master/imgs/logo.png"
	    });
	}, 5 * 60 * 1000);

})();