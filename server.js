// Dependencies
const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const app = express();
const server = http.Server(app);
const io = socketIO(server);
const port = 5000

// game dependencies 
const game = require("./game.js");

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

// send message to client every 1s
setInterval(function() {
    io.sockets.emit('message', 'hi!');
  }, 1000);


// src: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
}

// game objects
let board = game.get_board();

let players = {};

// every time a request is made
io.on('connection', function(socket) {
  // if it is a new player (new instance of game.js)
  socket.on('new player', function(name, color) {
    if(players.length < 4) {
      io.sockets.emit('debug', socket.id);
      players[socket.id] = game.new_player(name, color);
      io.sockets.emit(players[socket.id])
    }
  });

  // if message is "shuffle"
  socket.on('shuffle', function() {
    console.log(board.board_name)
    console.log(board.tiles[0].name)

    shuffle(board.tiles);
    io.sockets.emit('state', board.tiles);
    // io.sockets.emit('debug', board.tiles[0].name);
  });
});
