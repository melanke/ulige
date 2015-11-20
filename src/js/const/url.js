module.exports = {
    HOME: "/feeds/posts/default/?alt=json&max-results=1000",
    SEARCH: function(query) { return "/feeds/posts/default/?alt=json&q=" + query },
    TAG: function(tagname) { return "/feeds/posts/default/-/" + tagname + "/?alt=json" }
};