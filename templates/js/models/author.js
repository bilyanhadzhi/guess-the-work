function Author(name, element, buttonEl) {
    this.name = name;
    this.picked = true;
    this.element = element;
    this.buttonEl = buttonEl;

    this.togglePickedStatus = function() {
        this.picked = !(this.picked);

        if (this.picked) {
            this.element.children[1].classList.add('picked');
        } else {
            this.element.children[1].classList.remove('picked');
        }
    };
}
