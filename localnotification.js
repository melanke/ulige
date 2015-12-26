setInterval(function(){
	self.registration.showNotification("Novo post", {  
      body: "Na categoria \"Entretenimento\"",  
      icon: "https://cdn.rawgit.com/melanke/ulige/master/imgs/logo.png"
    });
}, 5 * /*60 */ 1000);