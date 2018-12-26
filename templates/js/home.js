document.addEventListener('DOMContentLoaded', function() {
    {% include 'js/models/author.js' %}

    var game = {
        on: false,
        init: function() {

        },
        begin: function(authors) {
            this.on = true;
            this.authors = authors;
            console.log('game on!', authors);
        },
    };

    var newGameScreen = {
        init: function() {
            this.cacheDOM();
            this.populateAuthors();
            this.bindEvents();
        },
        cacheDOM: function() {
            this.containerEl = document.getElementsByClassName('authors-form')[0];
            this.authorElements = document.getElementsByClassName('author-list')[0].children;
            this.startBtn = document.getElementById('start-btn');
        },
        bindEvents: function() {
            // bind picked-status switching
            this.authors.forEach(function(author) {
                author.buttonEl.addEventListener('click', function() {
                    author.togglePickedStatus();
                }.bind(this));
            }.bind(this));

            this.startBtn.addEventListener('click', this.startGame.bind(this));
        },
        populateAuthors: function() {
            var authors = {{ authors|safe }};
            this.authors = [];

            for (var i = 0; i < authors.length; ++i) {
                var authorName = authors[i];
                var authorElement = this.authorElements[i];
                var authorButton = this.authorElements[i].children[0];

                this.authors[i] = new Author(authorName, authorElement, authorButton);
            }
        },
        startGame: function() {
            this.hide();
            game.begin(this.getPickedAuthors());
        },
        hide: function() {
            this.containerEl.style.display = 'none';
        },
        getPickedAuthors: function() {
            return this.authors.filter(function(author) {
                return author.picked;
            });
        },
    };

    newGameScreen.init();
});
