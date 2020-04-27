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
// let game_manager.board = game.get_board();
// let game_manager.players = {};
let game_manager = game.get_game_manager();

// every time a request is made
io.on('connection', function(socket) {
  // get client ip
  let ip = socket.handshake.address;

  // new client instance, check to see if they are already registered as a player
  socket.on('new client', function() {
    if(ip in game_manager.players) {
      // welcome player back
      io.to(socket.id).emit('debug', `welcome back ${game_manager.players[ip].name}`)
      // instruct this client to update their player menu
      io.to(socket.id).emit('update player menu', game_manager.players[ip]);
      // instruct clients to update scoreboard
      io.sockets.emit('update scoreboard', game_manager.players);
    }
    else {
      io.to(socket.id).emit('debug', `please enter your name and color to join the game.`)
    }
  });

  socket.on('new player', function(name, color) {
    if (/\S/.test(name) && /\S/.test(color)) {
      // if it is a new player 
      if(!(ip in game_manager.players)) {
        // limit number of game_manager.players to 4
        if(Object.keys(game_manager.players).length < 4) {
          game_manager.new_player(name, color, Object.keys(game_manager.players).length + 1, ip);
          io.to(socket.id).emit('debug', `welcome ${game_manager.players[ip].name}`)
        }
      }
      // else update player info
      else {
        game_manager.players[ip].name = name;
        game_manager.players[ip].color = color;
        // TODO: redraw all player assets on game_manager.board
        io.to(socket.id).emit('debug', `welcome back ${game_manager.players[ip].name}`)
      }
      // instruct this client to update their player menu
      io.to(socket.id).emit('update player menu', game_manager.players[ip]);
      // instruct clients to update scoreboard
      io.sockets.emit('update scoreboard', game_manager.players);;

    }
    else {
      io.to(socket.id).emit('debug', "You must enter your player info before beginning the game.");
    }
    console.log(game_manager.players[ip])
  });

  // if message is "shuffle"
  socket.on('shuffle', function() {
    if(game_manager.validate_player(ip)) {
      io.to(socket.id).emit('debug', "You must enter your player info before beginning the game.");
      return;
    }
    console.log("received shuffle");
    game_manager.board.shuffle_board();
    io.sockets.emit('state', game_manager.board.tiles);
  });

  // if message is "start"
  socket.on('start', function() {
    if(game_manager.validate_player(ip)) {
      io.to(socket.id).emit('debug', "You must enter your player info before beginning the game.");
      return;
    }
    // start turn state machine
    io.sockets.emit('state', game_manager.board.tiles);
  });

  socket.on('roll dice', function() {
    if(game_manager.validate_player(ip)) {
      io.to(socket.id).emit('debug', "You must enter your player info before beginning the game.");
      return;
    }
    game_manager.roll_dice();
    game_manager.allocate_resources();
    console.log(game_manager.players[ip]);
    io.sockets.emit('new dice roll', game_manager.dice);
    // instruct this client to update their player menu
    io.to(socket.id).emit('update player menu', game_manager.players[ip]);
    // instruct clients to update scoreboard
    io.sockets.emit('update scoreboard', game_manager.players);;
  });

  // if message is "build road"
  socket.on('build road', function() {
    if(game_manager.validate_player(ip)) {
      io.to(socket.id).emit('debug', "You must enter your player info before beginning the game.");
      return;
    }
    // send message to allow roads to appear on THIS player's screen
    // can only build road if they have the correct resources
    io.to(socket.id).emit('enable road building');
  });

  // if message is "build colony"
  socket.on('build colony', function() {
    if(game_manager.validate_player(ip)) {
      io.to(socket.id).emit('debug', "You must enter your player info before beginning the game.");
      return;
    }
    // send message to allow roads to appear on THIS player's screen
    // can only build road if they have the correct resources
    io.to(socket.id).emit('enable colony building');
  });

  // if message is "place road"
  socket.on('place road', function(position) {
    if(game_manager.validate_player(ip)) {
      io.to(socket.id).emit('debug', "You must enter your player info before beginning the game.");
      return;
    }
    // place new road based on position and user ip
    if(game_manager.players[ip].roads > 0 && game_manager.board.roads[position - 1].owner === 0){
      game_manager.board.roads[position - 1].owner = game_manager.players[ip].player_number;
      new_road = {position: position, color: game_manager.players[ip].color};
      game_manager.players[ip].roads--;
      io.sockets.emit('new road', new_road);
    }
    else {
      io.to(socket.id).emit('out of roads', "You cannot build a road here.")
    }
    console.log(game_manager.players[ip].roads);
  });

  // if message is "place colony"
  socket.on('place colony', function(position) {
    if(game_manager.validate_player(ip)) {
      io.to(socket.id).emit('debug', "You must enter your player info before beginning the game.");
      return;
    }
    // place new road based on position and user ip
    if(game_manager.players[ip].colonies > 0 && game_manager.board.colonies[position - 1].owner === 0){
      game_manager.board.colonies[position - 1].owner = game_manager.players[ip].player_number;
      new_colony = {position: position - 1, color: game_manager.players[ip].color};
      game_manager.players[ip].colonies--;
      io.sockets.emit('new colony', new_colony);
    }
    else {
      io.to(socket.id).emit('out of colonies', "You cannot build a colony here.")
    }
    console.log(game_manager.players[ip].colonies);
  });
  
});
