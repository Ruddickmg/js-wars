module.exports = {
    describe: function (selected) {
        if (selected.description && selected.description()) 
            app.input.message(selected.description());
    },
    getHorizontal: function () { return this.hElement; },
    getVerticle: function () { return this.vElement; },
    verticle: function (elements) { return this.move(elements, ['up','down']);},
    horizontal: function (elements) { return this.move(elements, ['left','right']);},
    move: function (elements, keys) { return app.key.pressed(keys[1]) ? elements.next() : elements.prev(); },
    setHorizontal: function (e) {
        var selected = e.current();
        this.describe(selected);
        this.hElement = selected;
        return this;
    },
    setVerticle: function (e) {
        if (e.descriptions()) this.describe(e);
        this.vElement = e;
        return this;   
    },
    touch: function (touched, elements) { 
        var index = elements.indexOf(touched);
        if (isNaN(index)) return false;
        elements.current().hide();
        this.setHorizontal(elements.setIndex(index).show('inline-block'));
    },
    clear: function () {
        delete this.vElement;
        delete this.hElement;
    }
};