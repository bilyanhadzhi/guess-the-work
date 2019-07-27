function Popup(el, shown) {
    this.el = el;
    this.shown = shown;

    this.show = function() {
        if (!(this.el.classList.contains('shown')) && !(this.shown)) {
            this.el.classList.add('shown');
            this.shown = true;

            setTimeout(this.hide.bind(this), 2000);
        }
    };

    this.hide = function() {
        if (this.el.classList.contains('shown')) {
            this.el.classList.remove('shown');

            setTimeout(function() {
                this.shown = false;
            }.bind(this), 500);
        }
    };
}
