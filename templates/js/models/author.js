function Author(authorID, authorName, element, buttonEl) {
    this.authorID = authorID;
    this.authorName = authorName;
    this.picked = true;
    this.element = element;
    this.buttonEl = buttonEl;

    this.togglePickedStatus = function() {
        this.picked = !(this.picked);
        this.updateStyle();
    };

    this.toggleOn = function() {
        this.picked = true;
        this.updateStyle();
    };

    this.toggleOff = function() {
        this.picked = false;
        this.updateStyle();
    };

    this.updateStyle = function() {
        if (this.picked) {
            this.element.children[1].classList.add('picked');
        } else {
            this.element.children[1].classList.remove('picked');
        }
    }
}
