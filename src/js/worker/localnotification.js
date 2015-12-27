(function(){

	var $ = require("jquery"),
	    URL = require("../const/url.js"),
	    simpleStorage = require("simpleStorage.js");

	fetch("https://melanke-test.blogspot.com.br/feeds/posts/default/?alt=json&max-results=10", {
	  mode: 'no-cors'
	}).then(function(resp){
		console.log(resp);
	});

	setInterval(function(){
		self.registration.showNotification("Novo post", {  
	      body: "Na categoria \"Entretenimento\"",  
	      icon: "https://cdn.rawgit.com/melanke/ulige/master/imgs/logo.png"
	    });
	}, 5 * 60 * 1000);

})();