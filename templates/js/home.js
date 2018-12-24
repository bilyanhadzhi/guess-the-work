document.addEventListener('DOMContentLoaded', function() {
    {% include 'js/models/author.js' %}

    var newGameScreen = {
        init: function() {
            this.cacheDOM();
            this.populateAuthors();
            this.bindEvents();
        },
        cacheDOM: function() {
            this.authorElements = document.getElementsByClassName('author-list')[0].children;
        },
        bindEvents: function() {
            // bind picked-status switching
            Object.keys(this.authors).forEach(function(key) {
                this.authors[key].buttonEl.addEventListener('click', function() {
                    this.authors[key].togglePickedStatus();
                }.bind(this));
            }.bind(this));
        },
        populateAuthors: function() {
            var authors = {{ authors|safe }};
            this.authors = {};

            for (var i = 0; i < authors.length; ++i) {
                var authorName = authors[i];
                var authorElement = this.authorElements[i];
                var authorButton = this.authorElements[i].children[0];

                this.authors[i] = new Author(authorName, authorElement, authorButton);
            }
        },
    };

    newGameScreen.init();
});
