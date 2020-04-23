// Dependencies
const express = require('express');
const http = require('http');
const path = require('path');
// note: socketIO uses JSON.stringify() natively to send and receive any objects
const socketIO = require('socket.io');
const app = express();
const server = http.Server(app);
const io = socketIO(server);
const port = 5000

// game dependencies 
const game = require("./game.js");

app.set('port', port);

// included directories for html and css
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

// send message to client every 1s
setInterval(function() {
    io.sockets.emit('message', 'hi!');
  }, 1000);


// game objects
let board = game.get_board();
let roads = game.get_roads();
let players = {};

// every time a request is made
io.on('connection', function(socket) {
  // if it is a new player (new instance of client.js)
  socket.on('new player', function(name, color) {
    if(Object.keys(players).length < 4) {
      io.sockets.emit('debug', socket.id);
      players[socket.id] = game.new_player(name, color);
      io.sockets.emit(players[socket.id])
    }
  });

  // if message is "shuffle"
  socket.on('shuffle', function() {
    console.log("received shuffle");
    board.shuffle_tiles();
    board.shuffle_numbers();
    io.sockets.emit('state', board.tiles);
  });

  // if message is "place road"
  socket.on('place road', function(position) {
    // place new road based on position and socket.id
    console.log(players[socket.id]);
    roads[position].owner = players[socket.id].name;
    new_road = {position: -1, color: ""};
    new_road.position = position;
    new_road.color = players[socket.id].color;
    io.sockets.emit('new road', new_road);
  });
});
