app.footer = require('../menu/footer.js');
app.input = require('../input/input.js');
app.type = require('../effects/typing.js');

module.exports = {
    
    entry: function (input) {
        var weather, name = input.name.value;
        if (!name) app.type.letters(input.description, 'A name must be entered for the game.');
        else if (name.length < 3) app.type.letters(input.description, 'Name must be at least three letters long.');
        else if (name) {
            setupScreenElement.removeChild(document.getElementById('descriptionOrChatScreen'));
            return name;
        }
        return false;
    },

    display: function (parent) {

        var textField = app.footer.display();
        var tfp = textField.parentNode;
        var existing = document.getElementById(tfp.id);
        var nameInput = app.input.form('name', textField, 'Enter name here.');
        textField.appendChild(nameInput);

        if (existing) parent.replaceChild(existing, tfp);
        else parent.appendChild(tfp);

        var nameInput = document.getElementById('nameForm');
        var description = document.getElementById('descriptions');
        var name = document.getElementById('nameInput');

        description.style.paddingTop = '2%';
        description.style.paddingBottom = '1.5%';
        description.parentNode.style.overflow = 'hidden';

        nameInput.style.display = 'block';
        nameInput.style.height = '30%';

        name.focus();

        return {
            input: nameInput,
            description: description,
            name: name
        };
    }
};