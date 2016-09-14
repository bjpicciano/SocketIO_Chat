// Sets your name and connects to the server
function setName() {
    var name = document.getElementById('inputName').value;

    document.getElementById('loginArea').style.display = 'none';
    document.getElementById('messageArea').style.display = 'block';

    name ? this.username = name: this.username = "user";

    appendToMessageList("you have connected as " + this.username);

    // Here is where we connect to the server
    this.socket = io.connect();

    setUpSocketListeners();
}

function say () {
    var messageField = document.getElementById('inputMessage');
    var message = messageField.value;
    messageField.value = "";

    if (!message) return window.alert("Please enter a message");

    appendToMessageList("me: " + message);

    this.socket.emit('say', message);
}

function appendToMessageList (message) {
    var ul = document.getElementById("messages");
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(message));
    ul.appendChild(li);
}

function getOnlineUsers () {
    this.socket.emit('getOnlineUsers');
}

// Declare listeners
function setUpSocketListeners () {
    var self = this;

    // When the server sends us a handshake we send one back, with our username.
    this.socket.on('handshake', function () {
        self.socket.emit('handshake', self.username)
    });

    this.socket.on('say', function (message) {
        appendToMessageList(message)
    });

    this.socket.on('getOnlineUsers', function (users) {
        var online = "";
        var count = 0;
        for (var idx in users) {
            count++;
            online += users[idx] + ", "
        }
        online = online.substring(0, online.length - 2);

        var message = count + " user(s) online: " + online;

        appendToMessageList(message)
    })
}