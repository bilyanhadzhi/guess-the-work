document.addEventListener('DOMContentLoaded', function() {
    var game = {
        init: function() {
            this.populateAuthors();
        },
        populateAuthors: function() {
            var authors = {{ authors|safe }};
            this.authors = {};

            for (var i = 0; i < authors.length; ++i) {
                this.authors[i] = {};
                this.authors[i].name = authors[i];
                this.authors[i].picked = true;
            }
        },
        cacheDOM: function() {

        },
        bindEvents: function() {

        },
    };

    game.init();
    console.log(game.authors);
});

