new autoComplete({
    data: {
        src: this.allTitles,
    },
    key: ['творба'],
    cache: false,
    resultsList: {
        render: true,
    },
    highlight: true,                       // Highlight matching results      | (Optional)
    resultItem: {                          // Rendered result item            | (Optional)
        content: function(data, source) {
            source.innerHTML = data.match;
        },
        element: "li"
    },
    onSelection: function(feedback) {             // Action script onSelection event | (Optional)
        newGameScreen.inputBoxEl.value = feedback.selection.value;
    }
});
