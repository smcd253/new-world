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
let players = {};
let player_num = 1;

// every time a request is made
io.on('connection', function(socket) {
  // get client ip
  let ip = socket.handshake.address;
  // if it is a new player (new instance of client.js)
  socket.on('new player', function(name, color) {
    if(Object.keys(players).length < 4) {
      if(!(ip in players)) {
        players[ip] = game.new_player(name, color, player_num);
        io.to(socket.id).emit('debug', `welcome player ${players[ip].player_number}`)
        player_num++;
      }
      else {
        io.to(socket.id).emit('debug', `welcome BACK player ${players[ip].player_number}`)
      }
      io.to(socket.id).emit('debug', `your ip = ${ip}`)
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
    board.shuffle_tiles();
    board.shuffle_numbers();
    io.sockets.emit('state', board.tiles);
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
    console.log(players[ip].roads);
  });
  
});
