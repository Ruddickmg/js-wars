/* --------------------------------------------------------------------------------------*\
    
    Footer.js controls the creation and coordination of footer elements

\* --------------------------------------------------------------------------------------*/

module.exports = {
    display: function () {

        var footer = app.display.info([], [], {section:'descriptionOrChatScreen', div:'descriptionOrChat'});
        this.setElement(footer);
        var textField = footer.children[0];

        var chat = document.createElement('ul');
        var description = document.createElement('h1');

        chat.setAttribute('id','chat');
        description.setAttribute('id','descriptions');

        textField.appendChild(chat);
        textField.appendChild(description);

        return textField;
    },
    setElement: function (element) {this.e = element;},
    element: function () { return this.e; }, // could cause problems
    remove: function () { 
        var element = this.element();
        if (element) element.parentNode.removeChild(element); 
    },
    scrolling: function () {
        var footer = document.createElement('footer');
        var info = document.createElement('p');
        var footSpan = document.createElement('span');
        footSpan.setAttribute('id','footerText');
        info.appendChild(footSpan);
        info.setAttribute('id', 'scrollingInfo');
        footer.setAttribute('id','footer');
        footer.appendChild(info);
        this.setElement(footer);
        this.setScrollBar(info);
        this.setSpan(footSpan);
        return footer;
    },
    hide: function () { this.element().display = 'none'; },
    show: function () { this.element().display = null; },
    setScrollBar: function (bar) {this.s = bar;},
    scrollBar: function () {return this.s;},
    setText: function (text) {
        this.t = text;
        this.scrollBar().innerHTML = text;
    },
    setSpan: function (span) {this.sp = span;},
    span: function () {return this.sp;},
    text: function () {return this.t;},
    width: function () {return this.element().offsetWidth;},
    textWidth: function () {return this.span().offsetWidth;},
    incriment: function () {return this.scrollBar().offsetWidth; },
    increase: function () {this.move(1);},
    decrease: function () {this.move(-1);},
    move: function (move) {this.setPosition(this.position() + move);},
    setPosition: function (position) {
        this.setLeft(position);
        this.p = position;
    },
    position: function () {return this.p;},
    reset:function () {this.setPosition(-(this.incriment() * 4));},
    setLeft: function (left) {this.scrollBar().style.left = left + 'px';},
    increase: function () {return this.setPosition(this.position() + 1);},
    scroll: function(message) {
        var scope = this, position = this.position();
        if (message) {
            if (this.scroller) clearTimeout(this.scroller);
            if (!position) this.setPosition(-this.incriment());
            this.setText(message);
        }
        this.position() <= this.width() ? this.increase() : this.reset();
        this.scroller = setTimeout(function(){ scope.scroll(); }, 8);
    }
};