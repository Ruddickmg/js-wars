/* --------------------------------------------------------------------------------------*\
    
    Typing.js controls typing effect in game menus

\* --------------------------------------------------------------------------------------*/

 module.exports = {
    defaults: function () { return this.speed = app.settings.typingSpeed * 10; },
    speed: app.settings.typingSpeed * 10,
    isPrev: function (sentance) { return this.text === sentance; },
    letters: function (element, sentance, followup) {
        if(!this.isPrev(sentance)) {
            this.text = sentance;
            element.innerHTML = '';
            return this.type(element, sentance, 0, followup);
        }
        return false;
    },
    type: function (element, sentance, index, followup) {
        var scope = this;
        this.typer = setTimeout(function () {
            if (sentance[index] && scope.isPrev(sentance)) { 
                element.innerHTML += sentance[index];
                index += 1;
                scope.type(element, sentance, index, followup);
            } else {
                if (followup) followup(element);
                if (scope.isPrev(sentance)) 
                    scope.reset();
                return false;
            }
        }, this.speed);
    },
    reset: function () { 
        clearTimeout(this.typer);
        delete this.text; 
    },
    setSpeed: function (speed) { this.speed = speed * 10; }
};