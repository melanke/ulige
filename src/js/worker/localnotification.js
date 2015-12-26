var $ = require("jquery"),
    URL = require("../const/url.js"),
    simpleStorage = require("simpleStorage.js");

module.exports = function() {

	$.get(URL.HOME, function(resp){
		console.log(resp);
	});

	setInterval(function(){
		self.registration.showNotification("Novo post", {  
	      body: "Na categoria \"Entretenimento\"",  
	      icon: "https://cdn.rawgit.com/melanke/ulige/master/imgs/logo.png"
	    });
	}, 5 * 60 * 1000);

};