document.addEventListener('DOMContentLoaded', function() {
    {% include 'js/models/author.js' %}

    var game = {
        on: false,
        questionNo: 0,
        currentQuestionText: '',
        currentQuestionTextIsShort: undefined,
        init: function() {
            this.cacheDOM();
        },
        cacheDOM: function() {
            this.containerEl = document.getElementsByClassName('game-container')[0];
            this.excerptContainerEl = document.getElementsByClassName('excerpt-container')[0];
        },
        begin: function(authors) {
            console.log(authors);
            this.on = true;
            this.authors = authors;

            this.showGameContainer();
            this.askQuestion();
        },
        end: function() {
            this.on = false;
            this.authors = [];

            // console.log('game off');
            // newGameScreen.reset();
        },
        setCurrentQuestionText: function(responseText) {
            this.currentQuestionText = responseText;
            this.currentQuestionTextIsShort = this.currentQuestionText.length < 200;
            
            this.renderQuestion();
        },
        renderQuestion: function() {
            if (this.currentQuestionTextIsShort) {
                this.setStyleForShortText();
            } else {
                this.setStyleForLongText();
            }

            this.excerptContainerEl.innerHTML = this.currentQuestionText;
        },
        askQuestion: function() {
            this.questionNo++;
            var randomAuthorIndex = Math.floor(Math.random() * this.authors.length);

            // get excerpt from API
            var randomAuthor = this.authors[randomAuthorIndex];

            console.log('our author: ', randomAuthor);

            api.getExcerpt(randomAuthor, this.setCurrentQuestionText.bind(this));
        },
        showGameContainer: function() {
            this.containerEl.style.display = 'block';
        },
        setStyleForShortText: function() {
            this.excerptContainerEl.style.justifyContent = 'center';
        },
        setStyleForLongText: function() {
            this.excerptContainerEl.style.justifyContent = 'flex-start';
        },
    };

    var api = {
        getExcerptURL: '/api/get_excerpt',
        getExcerpt: function(author, callback) {
            var xmlHttp = new XMLHttpRequest;

            xmlHttp.onreadystatechange = function() {
                if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                    callback(xmlHttp.responseText);
                }
            };
            
            // TODO: either make it secure or add some obfuscation
            // obfuscatedID = window.btoa(author.authorID);
            xmlHttp.open("GET", this.getExcerptURL + '?author_ids=' + author.authorID);
            xmlHttp.send();
        },
        testAnswer: function() {
            // TODO
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
    game.init();
});
