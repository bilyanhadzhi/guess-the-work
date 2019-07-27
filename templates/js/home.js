document.addEventListener('DOMContentLoaded', function() {
    {% include 'js/models/author.js' %}
    {% include 'js/models/popup.js' %}

    var game = {
        on: false,
        questionNo: 0,
        currentQuestionText: '',
        currentQuestionAnswerFieldText: '',
        currentQuestionTextIsShort: undefined,
        init: function() {
            api.getAllTitles(this.setAllTitles.bind(this));
            this.cacheDOM();
            this.bindEvents();
        },
        cacheDOM: function() {
            this.containerEl = document.getElementsByClassName('game-container')[0];
            this.excerptContainerEl = document.getElementsByClassName('excerpt-container')[0];
            this.answerForm = document.getElementById('answer-form');
            this.answerField = this.answerForm.elements['answer-field'];
            this.answerHiddenExcerpt = this.answerForm.elements['hidden-excerpt'];
            this.answerBtn = document.getElementById('answer-btn');
        },
        bindEvents: function() {
            this.answerField.addEventListener('change', this.updateAnswerFieldText.bind(this));
            this.answerForm.addEventListener('submit', this.answerQuestion.bind(this));
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
            this.updateHiddenExcerpt();
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
            this.resetAnswerFieldText();

            // get excerpt from API
            api.getExcerpt(this.authors, this.setCurrentQuestionText.bind(this));
        },
        answerQuestion: function() {
            api.submitAnswer(this.currentQuestionAnswerFieldText, this.currentQuestionText.replace(/<br ?\/?>/g, "\n"));
        },
        handleCorrectAnswer: function() {
            newGameScreen.popups.correctAnswerPopup.show();

            setTimeout(this.askQuestion.bind(this), 1000);
            console.log("Вярно");
        },
        handleIncorrectAnswer: function() {
            newGameScreen.popups.incorrectAnswerPopup.show();

            console.log("Грешно");
        },
        resetAnswerFieldText: function() {
            this.answerField.value = '';
        },
        updateAnswerFieldText: function() {
            this.currentQuestionAnswerFieldText = this.answerForm.elements['answer-field'].value;

            // console.log(this.currentQuestionAswerFieldText);
        },
        updateHiddenExcerpt: function() {
            this.answerHiddenExcerpt.value = this.currentQuestionText.replace(/<br ?\/?>/g, "\n");;
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
        submitAnswerURL: '/api/submit_answer',
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
        submitAnswer: function(answer, excerpt) {
            var xhr = new XMLHttpRequest();
            var url = this.submitAnswerURL;

            var params = '';
            params += 'answer=' + answer;
            params += '&excerpt=' + excerpt;

            xhr.open('POST', url, true);

            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

            xhr.onreadystatechange = function() {
                if(xhr.readyState == 4 && xhr.status == 200) {
                    var answerWasCorrect = !!+xhr.responseText;

                    if (answerWasCorrect) {
                        game.handleCorrectAnswer();
                    } else {
                        game.handleIncorrectAnswer();
                    }
                }
            }
            xhr.send(params);
        },
    };

    // ANOTHER TRY

    var newGameScreen = {
        popups: {
            noAuthorsPopup: new Popup(document.getElementById('no-authors-popup'), false),
            correctAnswerPopup: new Popup(document.getElementById('correct-answer-popup'), false),
            incorrectAnswerPopup: new Popup(document.getElementById('incorrect-answer-popup'), false),
        },
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
            this.noAuthorsPopup =
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
                this.popups.noAuthorsPopup.show();
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
    };

    newGameScreen.init();
    game.init();
});
