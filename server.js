// Dependencies
const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const app = express();
const server = http.Server(app);
const io = socketIO(server);
const port = 5000
app.set('port', port);
app.use('/static', express.static(__dirname + '/static'));
app.use(express.static(path.join(__dirname, '/public')));
// Main Page
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
  });


// Starts the server.
server.listen(port, function() {
    console.log('Starting server on port 5000');
  });
// WebSocket handlers
io.on('connection', function(socket) {
});
// setInterval(function() {
//     io.sockets.emit('message', 'hi!');
//   }, 1000);

let players = {};
io.on('connection', function(socket) {
    socket.on('new player', function() {
        players[socket.id] = {
        x: 300,
        y: 300
        };
    });
    socket.on('movement', function(data) {
        let player = players[socket.id] || {};
        if (data.left) {
        player.x -= 5;
        }
        if (data.up) {
        player.y -= 5;
        }
        if (data.right) {
        player.x += 5;
        }
        if (data.down) {
        player.y += 5;
        }
    });
});

setInterval(function() {
    io.sockets.emit('state', players);
  }, 1000 / 60);

