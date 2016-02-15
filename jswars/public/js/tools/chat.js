/* --------------------------------------------------------------------------------------*\

    handle user to user chat

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');

module.exports = {
    // add message for display, input is message object containing a user name and id, or just a message
    display: function (mo) {

        // construct message with user name or if there is no user name just use the message
        var message = mo.user ? mo.user + ': ' + mo.message : mo.message;

        // element that message is being appended to
        var chat = document.getElementById('chat');

        // if the message is a string then append it to the chat element
        if(chat && typeof (message) === 'string') {
            var chatMessage = document.createElement('li'); // create a list element to contain the message
            chatMessage.setAttribute('class', 'message'); // set attribute for styling
            chatMessage.innerHTML = message; // set text to message
            chat.appendChild(chatMessage); // append the li element to the chat element
            return message; // return the appended message
        }
        return false;
    },

    // send message, input is an object/element containing textual user input accessed by ".value"
    message: function (element) {
        var text = element.value; // user text input
        var name = app.user.screenName ? app.user.screenName : app.user.first_name; // get user name of user sending message
        if (name && text){ // make sure there is user input and a user name
            var message = { message:text, user:name }; // create message object containing user name and input text
            socket.emit('gameReadyChat', message); // transmit message to chat room
            element.value = ''; // reset the input box to empty for future input
            return message; // return the input message
        }
        return false;
    }
};