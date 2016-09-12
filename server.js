var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname));

io.on('connection', function (socket) {
    socket.emit('handshake');
    // socket.broadcast.emit('say', message);
    
    setEventHandlers(socket);
});

var sockets = {};

function setEventHandlers(socket) {
    sockets[socket.id] = socket;
    
    socket.on('disconnect', function () {
        var message = socket.username + " has disconnected ";

        console.log(message);
        socket.broadcast.emit('say', message);

        delete sockets[socket.id];

        socket.disconnect();
    });

    socket.on('handshake', function (name) {
        socket.username = name;
        var message = socket.username + " has connected";

        console.log(message);
        socket.broadcast.emit('say', message);
    });

    socket.on('say', function (message) {
        var nameWMessage = socket.username + ": " + message;

        console.log(nameWMessage);

        socket.broadcast.emit('say', nameWMessage);
    });
    
    socket.on('getOnlineUsers', function () {
        var users = [];
        for (var id in sockets) {
            users.push(sockets[id].username);
        }
        socket.emit('getOnlineUsers', users)
    })
}

var serverPort = process.env.PORT ||3000;

http.listen(serverPort, function () {
    console.log("Server is listening on port " + serverPort);
});