Button = function (id, action) {
    this.screen = document.getElementById(id);
    this.action = action;
    var button = document.createElement('div');
    button.setAttribute('class', 'button');
    button.setAttribute('id', 'startButton');
    button.style.display = 'none';
    this.button = button;
    this.screen.appendChild(button);
    var scope = this;
    this.button.addEventListener("click", function (event) {
        event.preventDefault();
        if (scope.action) scope.action();
    });
};
Button.prototype.show = function () {this.button.style.display = '';};
Button.prototype.hide = function () {this.button.style.display = 'none';};
Button.prototype.remove = function (){this.screen.removeChild(this.button);};
module.exports = Button;