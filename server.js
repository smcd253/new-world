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


// game objects
// let game_manager.board = game.get_board();
// let game_manager.players = {};
let game_manager = game.get_game_manager();


// WebSocket handlers (every time a connection is made)
io.on('connection', function(socket) {
  // get client ip
  let ip = socket.handshake.address;

  function update_client() {
    // update board
    // io.sockets.emit('update board', game_manager.board.tiles);

    // update roads
    // update colonies
  }

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

    // update everything else
    update_client();
  });

  socket.on('new player', function(name, color) {
    let result = game_manager.new_player(name, color, ip);
    if(result.success) {
      // instruct this client to update their player menu
      io.to(socket.id).emit('update player menu', game_manager.players[ip]);
      // instruct clients to update scoreboard
      io.sockets.emit('update scoreboard', game_manager.players);
    }
    
    io.to(socket.id).emit('debug', result.msg);
    
    // DEBUG
    console.log(game_manager.players[ip])
  });

  // if message is "shuffle"
  socket.on('shuffle', function() {
    if(game_manager.validate_player(ip)) {
      io.to(socket.id).emit('debug', "You must enter your player info before beginning the game.");
      return;
    }
    game_manager.board.shuffle_board();
    io.sockets.emit('update board', game_manager.board.tiles);
  });

  // if message is "start"
  socket.on('start', function() {
    if(game_manager.validate_player(ip)) {
      io.to(socket.id).emit('debug', "You must enter your player info before beginning the game.");
      return;
    }
    // start turn state machine
  });

  socket.on('roll dice', function() {
    if(game_manager.validate_player(ip)) {
      io.to(socket.id).emit('debug', "You must enter your player info before beginning the game.");
      return;
    }
    game_manager.roll_dice();
    game_manager.allocate_resources();

    // instruct clients to update dice roll on scoreboard
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
    // place new road 
    io.sockets.emit('new road', game_manager.place_road(position, ip));
  });

  // if message is "place colony"
  socket.on('place colony', function(position) {
    if(game_manager.validate_player(ip)) {
      io.to(socket.id).emit('debug', "You must enter your player info before beginning the game.");
      return;
    }
    // place new colony 
    io.sockets.emit('new colony', game_manager.place_colony(position, ip));
  });
  
});
