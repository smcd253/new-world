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

// game objects
let board = game.get_board();
let players = {};

// every time a request is made
io.on('connection', function(socket) {
  // get client ip
  let ip = socket.handshake.address;
  socket.on('new player', function(name, color) {
  // if it is a new player 
  if(!(ip in players)) {
    // limit number of players to 4
    if(Object.keys(players).length < 4) {
      players[ip] = game.new_player(name, color, Object.keys(players).length + 1);
      io.to(socket.id).emit('debug', `welcome player ${players[ip].player_number}`)
      // instruct clients to update scoreboard
      io.sockets.emit('update scoreboard', players);
    }
  }
  // else update player info
  else {
    players[ip].name = name;
    players[ip].color = color;
    // instruct clients to update scoreboard
    io.sockets.emit('update scoreboard', players);
    // TODO: redraw all player assets on board
    io.to(socket.id).emit('debug', `welcome BACK player ${players[ip].player_number}`)
  }
    
    console.log(players[ip])
  });

  // if message is "shuffle"
  socket.on('shuffle', function() {
    if(typeof players[ip] == "undefined") {
      io.to(socket.id).emit('debug', "You must enter your player info before beginning the game.");
      return;
    }
    console.log("received shuffle");
    board.shuffle_board();
    io.sockets.emit('state', board.tiles);
  });

  // if message is "start"
  socket.on('start', function() {
    // start turn state machine
    io.sockets.emit('state', board.tiles);
  });

  socket.on('roll dice', function() {
    console.log("received dice roll");
    board.roll_dice();
    console.log("new dice val = " + board.dice);
    io.sockets.emit('new dice roll', board.dice);
    io.sockets.emit('debug', "Dice Roll = " + board.dice);
  });

  // if message is "build road"
  socket.on('build road', function() {
    if(typeof players[ip] == "undefined") {
      io.to(socket.id).emit('debug', "You must enter your player info before beginning the game.");
      return;
    }
    // send message to allow roads to appear on THIS player's screen
    // can only build road if they have the correct resources
    io.to(socket.id).emit('enable road building');
  });

  // if message is "build colony"
  socket.on('build colony', function() {
    if(typeof players[ip] == "undefined") {
      io.to(socket.id).emit('debug', "You must enter your player info before beginning the game.");
      return;
    }
    // send message to allow roads to appear on THIS player's screen
    // can only build road if they have the correct resources
    io.to(socket.id).emit('enable colony building');
  });

  // if message is "place road"
  socket.on('place road', function(position) {
    if(typeof players[ip] == "undefined") {
      io.to(socket.id).emit('debug', "You must enter your player info before beginning the game.");
      return;
    }
    // place new road based on position and user ip
    if(players[ip].roads > 0){
      // roads[position].owner = players[ip].name;
      board.roads.owner = players[ip].name;
      new_road = {position: position, color: players[ip].color};
      players[ip].roads--;
      io.sockets.emit('new road', new_road);
    }
    else {
      io.to(socket.id).emit('out of roads', "You have no more roads to build with.")
    }
    console.log(players[ip].roads);
  });

  // if message is "place colony"
  socket.on('place colony', function(position) {
    if(typeof players[ip] == "undefined") {
      io.to(socket.id).emit('debug', "You must enter your player info before beginning the game.");
      return;
    }
    // place new road based on position and user ip
    if(players[ip].colonies > 0){
      // colonies[position].owner = players[ip].name;
      board.colonies.owner = players[ip].name;
      new_colony = {position: position, color: players[ip].color};
      players[ip].colonies--;
      io.sockets.emit('new colony', new_colony);
    }
    else {
      io.to(socket.id).emit('out of colonies', "You have no more colonies to build with.")
    }
    console.log(players[ip].colonies);
  });
  
});
