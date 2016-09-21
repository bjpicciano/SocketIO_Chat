/**
 * Sets the user's username and connects to
 * the server.
 */
function setName() {
    var name = document.getElementById('inputName').value;

    document.getElementById('loginArea').style.display = 'none';
    document.getElementById('messageArea').style.display = 'block';

    name ? this.username = name: this.username = "user";

    appendToMessageList("you have connected as '" + this.username + "'");

    // Here is where we connect to the server
    this.socket = io.connect('');

    setUpSocketListeners();
}

/**
 * Grabs the input from the html and displays the message.
 */
function say () {
    var messageField = document.getElementById('inputMessage');
    var message = messageField.value;
    messageField.value = "";

    if (!message) return window.alert("Please enter a message");

    appendToMessageList("me: " + message);

    if (hasConnection("failed to send message: ")) {
        this.socket.emit('say', message);
    }
}

/**
 * Takes a string and creates a text node
 * to be displayed in the html.
 * @param message the message to display
 * @param color optional text color
 */
function appendToMessageList (message, color) {
    var ul = document.getElementById("messages");
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(message));

    if (color) {
        var span = document.createElement('span');
        span.style.color= color;
        span.appendChild(li);
        ul.appendChild(span);
    } else {
        ul.appendChild(li);
    }
}

/**
 * If we are connected emit asking for a list of
 * the connected users.
 */
function getOnlineUsers () {
    if (hasConnection("failed to get online users: ")) {
        this.socket.emit('getOnlineUsers');
    }
}

/**
 * Checks to see if we have connection to the server.
 * if we don't we display an error message.
 * @param errMessage a message to append to the beginning of the error
 * @returns {boolean} our connection status
 */
function hasConnection (errMessage) {
    if (!this.isConnected) {
        appendToMessageList(errMessage + "server not connected", "red");
    }

    return this.isConnected;
}

/**
 * Declare our socket's listeners here.
 */
function setUpSocketListeners () {
    var self = this;

    // When the server sends us a handshake we send one back with our username
    this.socket.on('handshake', function () {
        self.socket.emit('handshake', self.username);
    });

    this.socket.on('say', function (message) {
        appendToMessageList(message);
    });

    // Loops through the given list of users and displays them
    this.socket.on('getOnlineUsers', function (users) {
        var online = "";
        var count = 0;
        for (var idx in users) {
            count++;
            if (users.hasOwnProperty(idx)) {
                online += users[idx] + ", ";
            }
        }
        online = online.substring(0, online.length - 2);

        var usersMessage = count + " user(s) online: " + online;

        appendToMessageList(usersMessage);
    });

    this.socket.on('connect_error', function () {
        if (self.isConnected) {
            self.isConnected = false;
            hasConnection("lost connection: ")
        }
    });

    this.socket.on('connect', function () {
        if (self.isConnected != undefined && !self.isConnected) {
            appendToMessageList("server reconnected", "green");
        }

        self.isConnected = true;
    });
}