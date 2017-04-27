/* --------------------------------------------------------------------------------------*\

    handle user to user chat

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.user = require('../user/user.js');
transmit = require("../sockets/transmitter.js");
playerController = require("../controller/player.js");

module.exports = {

    titled: function (user, message) {

        return user + ": " + message;
    },

    // add message for display, input is message object containing a user name and id, or just a message
    post: function (mo) {

        // construct message with user name or if there is no user name just use the message
        var user = mo.user, message = mo.message;

        message = user ? this.titled(user, message) : message;

        // if the message is a string then append it to the chat element
        if (this.chat && typeof (message) === 'string') {

            var chatMessage = document.createElement('li'); // create a list element to contain the message
            chatMessage.setAttribute('class', 'message'); // set attribute for styling
            chatMessage.innerHTML = message; // set text to message
            this.chat.appendChild(chatMessage); // append the li element to the chat element

            return message; // return the appended message
        }

        return false;
    },

    // send message, input is an object/element containing textual user input accessed by ".value"
    send: function (element) {

        var text = this.input(); // user text input
        var name = playerController.name(app.user.player());

        if (name && text){ // make sure there is user input and a user name
            
            var message = { message:text, user:name }; // create message object containing user name and input text
            
            transmit.message(message);

            element.value = ''; // reset the input box to empty for future input

            return message; // return the input message
        }
        return false;
    },

    input: function () { 

        return this.chatInput.value; 
    },

    display: function () {

        var bb = 5;
        
        this.chatScreen = document.getElementById('descriptionOrChatScreen');
        this.chatScreen.style.height = this.chatScreen.offsetHeight * 1.8 + 'px';

        this.chatBox = document.getElementById('descriptionOrChat');
        this.chat = document.getElementById('chat');
        this.chatBox.style.height = '77%';
        this.chatBox.style.borderBottomWidth = bb + 'px';

        this.chatInput = document.getElementById('chatInput');
        document.getElementById('descriptions').innerHTML = '';

        this.chatForm = document.getElementById('chatForm');
        this.chatForm.style.display = 'block';
        this.chatForm.style.height = '15%';
        this.chatForm.style.borderBottomWidth = bb + 'px';
        this.chat.style.display = 'block';
        this.chatInput.focus();
    },

    remove: function () {

        this.chatScreen.style.height = '20%';

        var doc = this.chatBox;
        doc.style.height = '83%';
        doc.style.borderBottomWidth = '12px';
        this.chat.style.display = 'none';

        var form = this.chatForm;
        form.style.height = '0px';
        form.style.display = 'none';
    }
};