/* --------------------------------------------------------------------------------------*\

    socket.js handles the socket connection and adds recieving methods

\* --------------------------------------------------------------------------------------*/

const addRecievers = require("../sockets/reciever.js");

module.exports = function (io) {

    const socket = io.connect("http://127.0.0.1:8080") || io.connect("http://jswars-jswars.rhcloud.com:8000");

    return addRecievers(socket);
}();