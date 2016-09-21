var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Serve our clients files from the base directory
app.use(express.static(__dirname));

/**
 * Here is where we listen for connecting users.
 */
io.on('connection', function (socket) {
    socket.emit('handshake');
    
    setEventHandlers(socket);
});

var sockets = {};

/**
 * This is where we set up our server's listeners.
 * @param socket the client's socket we are dealing with
 */
function setEventHandlers(socket) {
    sockets[socket.id] = socket;
    
    socket.on('disconnect', function () {
        var disconnectMessage = "'" + socket.username + "' has disconnected ";

        console.log(disconnectMessage);
        socket.broadcast.emit('say', disconnectMessage);

        delete sockets[socket.id];

        socket.disconnect();
    });
    
    socket.on('handshake', function (name) {
        socket.username = name;
        var connectMessage = "'" + socket.username + "' has connected";

        console.log(connectMessage);
        socket.broadcast.emit('say', connectMessage, "gray");
    });

    socket.on('say', function (message) {
        var nameWMessage = socket.username + ": " + message;

        console.log(nameWMessage);

        socket.broadcast.emit('say', nameWMessage);
    });
    
    socket.on('getOnlineUsers', function () {
        var users = [];
        for (var id in sockets) {
            if (sockets.hasOwnProperty(id)) {
                users.push(sockets[id].username);
            }
        }
        socket.emit('getOnlineUsers', users)
    })
}

var serverPort = process.env.PORT ||3000;

http.listen(serverPort, function () {
    console.log("Server is listening on port " + serverPort);
});