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

// step out of normal game loop for debugging
if (process.argv[2] === "debug") {
  game_manager.state = "debug";
}

// WebSocket handlers (every time a connection is made)
io.on('connection', function(socket) {
  // get client ip
  let ip = socket.handshake.address;

  function update_client() {
    // update board
    if(game_manager.board.is_shuffled){
      io.to(socket.id).emit('update board', game_manager.board.tiles);
    }

    if(Object.keys(game_manager.players).length > 0){
      io.to(socket.id).emit('update scoreboard', game_manager.players);
    }
    
    if(typeof game_manager.players[ip] !== "undefined") {
      io.to(socket.id).emit('update player menu', game_manager.players[ip]);
      console.log("instructing client to update player menu");
    }

    // TODO: this can be much more efficient
    // update roads (send client 'new road' for all roads that have been placed)
    for (let i = 0; i < game_manager.board.roads.length; i++) {
      if(game_manager.board.roads[i].owner !== 0) {
        let structure = {type: "road", 
                          data: {position: i + 1, color: game_manager.board.roads[i].color},
                          msg: "update"};
        io.sockets.emit('update structure', structure);
      }
    }
    // update colonies (send client 'new colony' for all colonies that have been placed)
    for (let i = 0; i < game_manager.board.colonies.length; i++) {
      if(game_manager.board.colonies[i].owner !== 0) {
        let structure = {type: "colony", 
                          data: {position: i + 1, color: game_manager.board.colonies[i].color},
                          msg: "update"};
        io.sockets.emit('update structure', structure);
      }
    }
  }

  // new client instance, check to see if they are already registered as a player
  socket.on('new client', function() {
    if(ip in game_manager.players) {
      // welcome player back
      io.to(socket.id).emit('debug', `welcome back ${game_manager.players[ip].name}`)
    }
    else {
      io.to(socket.id).emit('debug', `Please enter your name and color to join the game.`)
    }
    update_client();

  });

  socket.on('new player', function(name, color) {
    // state machine filter
    if(!game_manager.state_machine('new player', ip)){
      io.to(socket.id).emit('debug', "Cannot add new player. Game has already begun.");
      return;
    }

    let result = game_manager.new_player(name, color, ip);
    if(result.success) {
      // instruct this client to update their player menu
      io.to(socket.id).emit('update player menu', game_manager.players[ip]);
      // instruct clients to update scoreboard
      io.sockets.emit('update scoreboard', game_manager.players);
    }
    
    io.to(socket.id).emit('debug', result.msg);
    update_client();

    // DEBUG
    console.log(game_manager.players[ip])
  });

  // if message is "shuffle"
  socket.on('shuffle', function() {
    // state machine filter
    if(!game_manager.state_machine('shuffle', ip)){
      io.to(socket.id).emit('debug', "Action not allowed");
      return;
    }
    
    // valid player filter
    if(game_manager.validate_player(ip)) {
      io.to(socket.id).emit('debug', "You must enter your player info before beginning the game.");
      return;
    }
    game_manager.board.shuffle_board();
    io.sockets.emit('update board', game_manager.board.tiles);
    update_client();
  });

  // if message is "start"
  socket.on('start', function() {
    // state machine filter
    if(!game_manager.state_machine('start', ip)){
      io.to(socket.id).emit('debug', "Action not allowed.");
      return;
    }
    
    // valid player filter
    if(game_manager.validate_player(ip)) {
      io.to(socket.id).emit('debug', "You must enter your player info before beginning the game.");
      return;
    }
    update_client();
  });

  socket.on('roll dice', function() {
    // state machine filter
    if(!game_manager.state_machine('roll dice', ip)){
      io.to(socket.id).emit('debug', "Action not allowed.");
      return;
    }
    
    // valid player filter
    if(game_manager.validate_player(ip)) {
      io.to(socket.id).emit('debug', "You must enter your player info before beginning the game.");
      return;
    }

    game_manager.roll_dice();
    game_manager.allocate_resources();

    // instruct clients to update dice roll on scoreboard
    io.sockets.emit('new dice roll', game_manager.dice);
    update_client();
  });

  socket.on('finish turn', function() {
    // state machine filter
    if(!game_manager.state_machine('finish turn', ip)){
      io.to(socket.id).emit('debug', "Action not allowed.");
      return;
    }
    
    // valid player filter
    if(game_manager.validate_player(ip)) {
      io.to(socket.id).emit('debug', "You must enter your player info before beginning the game.");
      return;
    }

    io.sockets.emit('debug', `player ${game_manager.players[ip].player_number} has finished their turn.`);
    update_client();
  });

  // if message is "build road"
  socket.on('build road', function() {
    // state machine filter
    if(!game_manager.state_machine('build road', ip)){
      io.to(socket.id).emit('debug', "Action not allowed.");
      return;
    }
    
    // valid player filter
    if(game_manager.validate_player(ip)) {
      io.to(socket.id).emit('debug', "You must enter your player info before beginning the game.");
      return;
    }
    // send message to allow roads to appear on THIS player's screen
    // can only build road if they have the correct resources
    io.to(socket.id).emit('enable road building');
    update_client();
  });

  // if message is "build colony"
  socket.on('build colony', function() {
    // state machine filter
    if(!game_manager.state_machine('build colony', ip)){
      io.to(socket.id).emit('debug', "Action not allowed.");
      return;
    }
    
    // valid player filter
    if(game_manager.validate_player(ip)) {
      io.to(socket.id).emit('debug', "You must enter your player info before beginning the game.");
      return;
    }
    // send message to allow roads to appear on THIS player's screen
    // can only build road if they have the correct resources
    io.to(socket.id).emit('enable colony building');
    update_client();
  });

  // if message is "place road"
  socket.on('place road', function(position) {
    /**
     * NOTE: do not need state machine filter because we have already stopped this 
     * player from building if it is not appropriate to build in this state or turn
     */
    // valid player filter
    if(game_manager.validate_player(ip)) {
      io.to(socket.id).emit('debug', "You must enter your player info before beginning the game.");
      return;
    }
    // place new road 
    io.sockets.emit('new road', game_manager.place_road(position, ip));
    update_client();
  });

  // if message is "place colony"
  socket.on('place colony', function(position) {
    /**
     * NOTE: do not need state machine filter because we have already stopped this 
     * player from building if it is not appropriate to build in this state or turn
     */
    if(game_manager.validate_player(ip)) {
      io.to(socket.id).emit('debug', "You must enter your player info before beginning the game.");
      return;
    }
    // place new colony 
    io.sockets.emit('new colony', game_manager.place_colony(position, ip));
    update_client();
  });
  
});
