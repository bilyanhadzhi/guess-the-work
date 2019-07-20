document.addEventListener('DOMContentLoaded', function() {
    {% include 'js/models/author.js' %}

    var game = {
        on: false,
        questionNo: 0,
        currentQuestionText: '',
        currentQuestionTextIsShort: undefined,
        init: function() {
            api.getAllTitles(this.setAllTitles.bind(this));
            this.cacheDOM();
        },
        cacheDOM: function() {
            this.containerEl = document.getElementsByClassName('game-container')[0];
            this.excerptContainerEl = document.getElementsByClassName('excerpt-container')[0];
        },
        begin: function(authors) {
            // console.log(authors);
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
        setAllTitles: function(titles) {
            this.allTitles = JSON.parse(titles);

            {% include 'js/answer-autocomplete.js' %}
        },
        setCurrentQuestionText: function(responseText) {
            this.currentQuestionText = responseText;
            this.currentQuestionTextIsShort = this.currentQuestionText.length < 300;

            this.renderQuestion();
        },
        renderQuestion: function() {
            if (this.currentQuestionTextIsShort) {
                this.setStyleForShortText();
            } else {
                this.setStyleForLongText();
            }

            window.scrollTo(0, 0);
            this.excerptContainerEl.innerHTML = this.currentQuestionText;
        },
        askQuestion: function() {
            this.questionNo++;

            // get excerpt from API
            api.getExcerpt(this.authors, this.setCurrentQuestionText.bind(this));
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
        getAllTitlesURL: '/api/get_all_titles',
        getExcerpt: function(authors, callback) {
            if (authors.length < 1) {
                return;
            }

            var authorIDsString = "";

            // console.log(authors);
            // turn author ids into csv
            for (var i = 0; i < authors.length; ++i) {
                authorIDsString += authors[i].authorID;
                authorIDsString += ',';
            }

            authorIDsString = authorIDsString.substring(0, authorIDsString.length - 1);

            var xmlHttp = new XMLHttpRequest;

            xmlHttp.onreadystatechange = function() {
                if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                    callback(xmlHttp.responseText);
                }
            };

            // console.log(authorIDsString);

            // TODO: either make it secure or add some obfuscation
            // right now very easy to cheat the author
            xmlHttp.open("GET", this.getExcerptURL + '?author_ids=' + authorIDsString);
            xmlHttp.send();
        },
        getAllTitles: function(callback) {
            var xmlHttp = new XMLHttpRequest;

            xmlHttp.onreadystatechange = function() {
                if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                    callback(xmlHttp.responseText);
                }
            };

            xmlHttp.open("GET", this.getAllTitlesURL);
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
            this.markAllBtn = document.getElementById('mark-all-btn');
            this.unmarkAllBtn = document.getElementById('unmark-all-btn');
            this.noAuthorsPopup = document.getElementById('no-authors-popup');
            this.inputBoxEl = document.getElementById('autoComplete');
        },
        bindEvents: function() {
            // bind picked-status switching
            this.authors.forEach(function(author) {
                author.buttonEl.addEventListener('click', function() {
                    author.togglePickedStatus();
                }.bind(this));
            }.bind(this));

            this.startBtn.addEventListener('click', this.startGame.bind(this));
            this.markAllBtn.addEventListener('click', this.toggleAllAuthorsOn.bind(this));
            this.unmarkAllBtn.addEventListener('click', this.toggleAllAuthorsOff.bind(this));
        },
        populateAuthors: function() {
            var authors = {{ authors|safe }};
            this.authors = [];

            for (var i = 0; i < authors.length; ++i) {
                var authorName = authors[i];
                var authorElement = this.authorElements[i];
                var authorButton = this.authorElements[i].children[0];

                this.authors[i] = new Author(i + 1, authorName, authorElement, authorButton);
            }
        },
        startGame: function() {
            pickedAuthors = this.getPickedAuthors();

            if (pickedAuthors.length > 0) {
                this.hide();
                game.begin(pickedAuthors);
            } else {
                this.showNoAuthorsPopup();
                // alert('Не сте избрали автори!');
            }
        },
        toggleAllAuthorsOn: function() {
            for (var i = 0; i < this.authors.length; ++i) {
                this.authors[i].toggleOn();
            }

            this.cacheDOM();
        },
        toggleAllAuthorsOff: function() {
            for (var i = 0; i < this.authors.length; ++i) {
                this.authors[i].toggleOff();
            }
            this.cacheDOM();
        },
        hide: function() {
            this.containerEl.style.display = 'none';
        },
        getPickedAuthors: function() {
            return this.authors.filter(function(author) {
                return author.picked;
            });
        },
        showNoAuthorsPopup: function() {
            if (this.noAuthorsPopup.classList.contains('shown') == false) {
                this.noAuthorsPopup.classList.add('shown');
            }

            setTimeout(this.hideNoAuthorsPopup.bind(this), 2000);
        },
        hideNoAuthorsPopup: function() {
            if (this.noAuthorsPopup.classList.contains('shown')) {
                this.noAuthorsPopup.classList.remove('shown');
            }
        }
    };

    newGameScreen.init();
    game.init();
});
