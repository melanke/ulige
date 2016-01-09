var $ = require("jquery"),
	defaultInterface = require("../service/defaultInterface.js");

module.exports = function() {

	var init = function(){
		var page = $("#staticpage-content").html();
		defaultInterface();
		$("#main").html(page);
	};

	init();

};