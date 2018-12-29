document.addEventListener('DOMContentLoaded', function() {
    {% include 'js/models/author.js' %}

    var game = {
        on: false,
        question_no: 0,
        current_question_text: '',
        init: function() {

        },
        begin: function(authors) {
            this.on = true;
            this.authors = authors;
            console.log('game on!', authors);

            this.askQuestion();
        },
        askQuestion: function() {
            this.question_no++;
            var randomAuthorIndex = Math.floor(Math.random() * 15);

            // get excerpt from API
            console.log('author: ', this.authors[randomAuthorIndex]);
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

                this.authors[i] = new Author(i+1, authorName, authorElement, authorButton);
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
