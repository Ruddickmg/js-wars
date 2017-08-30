/* ------------------------------------------------------------------------------- *\

    Input handles user input (Generally displayed via the footer element)

\* ------------------------------------------------------------------------------- */

app.type = require('../effects/typing.ts');

module.exports = {
    
    // takes the name of the form, the element it is being inserted into and 
    // a placeholder/words to be displayed in the form box before entry
	form: function (name, element, placeHolder) {
        
        var input = document.createElement('p');
        input.setAttribute('class', 'inputForm');
        input.setAttribute('id', name + 'Form');

        var text = document.createElement('input');
        text.setAttribute('id', name + 'Input');
        text.setAttribute('class','textInput');
        text.setAttribute('autocomplete','off');
        text.setAttribute('type','text');

        if (placeHolder) text.setAttribute('placeholder', placeHolder);

        text.style.width = element.offsetWidth;
        input.appendChild(text);
        return input;
    },

    // returns user input if it is found and adequate
    entry: function () {
        var name = this.valueOfCurrentElement();

        // inform the user that no input was detected
        if (!name) app.type.letters (this.description, 'A name must be entered for the game.');

        // inform the user that input must be over three charachtors long
        else if (name.length < 3) app.type.letters (this.description, 'Name must be at least three letters long.');
        
        // return the input value
        else if (name) {
            this.val = name;
            return name;
        }
        return false;
    },

    // create display screen for name input
    name: function (parent, text) {

        this.a = true;
        var existing = document.getElementById('descriptionOrChatScreen');
        var textField = this.text = app.footer.display();
        var tfp = textField.parentNode;
        this.parent = tfp;

        if (existing) parent.replaceChild(tfp, existing);
        else parent.appendChild(tfp);

        this.description = document.getElementById('descriptions');
        this.description.style.paddingTop = '2%';
        this.description.style.paddingBottom = '1.5%';
        this.description.parentNode.style.overflow = 'hidden';

        this.addInput();
        app.type.letters(this.description, text || 'Enter name for game.');

        return tfp;
    },

    // remove the screen and deactivate input
    remove: function () {
        this.a = false;
        app.confirm.deactivate();
        app.type.reset();
        delete this.val;
        app.footer.removePlayer();
        app.screen.reset();
    },
    active: function () { return this.a; },

    // remove input form from footer
    clear: function () { 
        if (this.a) {
            this.description.style.paddingTop = null;
            this.description.style.paddingBottom = null;
            this.nameInput.style.display = null;
            this.nameInput.style.height = null;
            this.a = false;
        }
    },
    removeInput: function () { 
        this.text.removeChild(this.nameInput); 
        //this.description.style.display = 'inline-block';
        //this.text.style.display = 'inline-block';
    },
    addInput: function () {
        this.text.appendChild(this.form('name', this.text, 'Enter name here.'));
        this.nameInput = document.getElementById('nameForm');
        this.nameInput.style.display = 'block';
        this.nameInput.style.height = '30%';
        // this.description.style.display = null;
        document.getElementById('nameInput').focus();
    },
    value: function () { return this.val || document.getElementById('nameInput').valueOfCurrentElement; },
    goBack: function () {
        this.a = true;
        this.b = true;
    },
    a:false,
    back: function () { return this.b; },
    undoBack: function () { this.b = false; },
    activate: function () { this.a = true; },
    deactivate: function () {this.a = false;},
    descriptions: function () { return document.getElementById('descriptions'); },
    message: function (message) { return app.type.letters(this.descriptions(), message); }
};