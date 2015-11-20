var $ = require("jquery");
    
module.exports = {
	single:  function(post)
	{
		post.preview = { 
			img: $(".data-thumbnail", "<div>"+post.content.$t+"</div>").attr("src"),
			text: $(".data-description", "<div>"+post.content.$t+"</div>").html()
		};

		post.cover = $(".data-cover", "<div>"+post.content.$t+"</div>").data("url");

		for (var j in post.link) {
         	if (post.link[j].rel === "alternate") {
                post.url = post.link[j].href;
                break;
            }
        }
	},

	multi: function(data) {

		var posts = [];

		for (var i in data.feed.entry) {
			var post = data.feed.entry[i];

			this.single(post);
			posts.push(post);
		}

		return posts;

	}
};