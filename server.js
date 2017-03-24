// Load the TCP Library
net = require('net');

var port = process.env.PORT || 80;
var app_port = 443;

// Keep track of the chat clients
var clients = [];

net.createServer(function (socket) {
  socket.write("Welcome " + socket.name + "\n");
}).listen(port);

// Start a TCP Server
net.createServer(function (socket) {
  // Identify this client
  socket.name = socket.remoteAddress + ":" + socket.remotePort

  // Put this new client in the list
  clients.push(socket);

  // Send a nice welcome message and announce
  socket.write("Welcome " + socket.name + "\n");
  broadcast(socket.name + " joined the chat\n", socket);

  // Handle incoming messages from clients.
  socket.on('data', function (data) {
    broadcast(socket.name + "> " + data, socket);
  });

  // Remove the client from the list when it leaves
  socket.on('end', function () {
    clients.splice(clients.indexOf(socket), 1);
    broadcast(socket.name + " left the chat.\n");
  });

  //Handle disconnect
  socket.on("error", (err) => {
    clients.splice(clients.indexOf(socket), 1);
    broadcast(socket.name + " left the chat.\n");
  });

  // Send a message to all clients
  function broadcast(message, sender) {
    clients.forEach(function (client) {
      // Don't want to send it to sender
      if (client === sender) return;
      client.write(message);
    });
    // Log it to the server output too
    process.stdout.write(message)
  }

}).listen(app_port);

// Put a friendly message on the terminal of the server.
console.log("Chat server running\n");
console.log("Ports: "+port+":"+app_port);
