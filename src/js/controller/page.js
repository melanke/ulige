var $ = require("jquery"),
	defaultInterface = require("../service/defaultInterface.js");

module.exports = function() {

	var init = function(){
		var page = $("#staticpage-content");
		defaultInterface();
		$("#main").html(page);
	};

	init();

};