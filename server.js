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
const game = require("./backend/game_manager.js");

app.set('port', port);

// included directories for html and css
app.use('/static', express.static(__dirname + '/static'));
app.use(express.static(path.join(__dirname, '/public')));

// Main Page
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, '/public/index.html'));
  });


// Starts the server.
server.listen(port, function() {
    console.log('Starting server on port 5000');
  });

// game objects
let game_manager = game.get_new_game_manager();

// step out of normal game loop for debugging
if (process.argv[2] === "debug") {
  game_manager.state = "debug";
}

// create room for active players to join (to receive player-specific messages)
let game_room = "game_room";

/**
 * WebSocket handlers (every time a connection is made)
 * @param {Object} socket
 */
io.on('connection', function(socket) {
  // get client ip
  let ip = socket.handshake.address;
  
  /**
   * update clients with relevant information
   */
  function update_clients() {
    // update this client
    if(game_manager.board.is_shuffled){
      io.to(socket.id).emit('update board', game_manager.board.tiles);
    }
  
    if(Object.keys(game_manager.players).length > 0){
      io.to(socket.id).emit('update scoreboard', game_manager.players);
    }
    
    if(typeof game_manager.players[ip] !== "undefined") {
      io.to(socket.id).emit('update player menu', game_manager.players[ip]);
    }
  
    // update all clients
    io.sockets.emit('update scoreboard', game_manager.players);
    // TODO: this can be much more efficient
    // update roads (send clients 'new road' for all roads that have been placed)
    for (let i = 0; i < game_manager.board.roads.length; i++) {
      if(game_manager.board.roads[i].owner !== 0) {
        let structure = {type: "road", 
                          data: {position: i + 1, color: game_manager.board.roads[i].color},
                          msg: "update"};
        io.sockets.emit('update structure', structure);
      }
    }
    // update colonies (send clients 'new colony' for all colonies that have been placed)
    for (let i = 0; i < game_manager.board.colonies.length; i++) {
      if(game_manager.board.colonies[i].owner !== 0) {
        let structure = {type: "colony", 
                          data: {position: i + 1, color: game_manager.board.colonies[i].color},
                          msg: "update"};
        io.sockets.emit('update structure', structure);
      }
    }

    // if this player has won the game, let everyone know!
    if(game_manager.state_machine('game over', ip)){
      if(typeof game_manager.players[ip] !== "undefined") {
        io.to(socket.id).emit('server message all clients', `${game_manager.players[ip].name} wins!`);
      }
    }
  }

  /**
   * new client instance, check to see if they are already registered as a player
   */
  socket.on('new client', function() {
    if(game_manager.state === "setup") {
      if(ip in game_manager.players) {
        // welcome player back
        io.to(socket.id).emit('server message', `welcome back ${game_manager.players[ip].name}`)
        // re-add player to chat room
        socket.join(game_room);
      }
      else {
        io.to(socket.id).emit('server message', `Please enter your name and color to join the game.`)
      }
    }
    else {
      io.to(socket.id).emit('server message', `Game already in progress. You are welcome to stay as a spectator.`)
    }  
    update_clients();
  });

  /**
   * Create a new player if we are not already playing the game and there are
   * less than 4 players already registered.
   * @param {string} name
   * @param {string} color
   */
  socket.on('new player', function(name, color) {
    // state machine filter
    if(!game_manager.state_machine('new player', ip)){
      io.to(socket.id).emit('server message', "Cannot add new player. Game has already begun.");
      return;
    }

    let result = game_manager.new_player(name, color, ip);
    if(result.success) {
      // instruct this client to update their player menu
      io.to(socket.id).emit('update player menu', game_manager.players[ip]);
      // instruct clients to update scoreboard
      io.sockets.emit('update scoreboard', game_manager.players);
      // add player to chat room
      socket.join(game_room);
    }
    
    io.to(socket.id).emit('server message', result.msg);
    if(result.bcast !== "") socket.broadcast.emit('broadcast', result.bcast);
    update_clients();

    // DEBUG
    // console.log(game_manager.players[ip])
  });

  /**
   * instruct the clients to redraw their boards
   * if the game state machine allows it and
   * if the message comes from a valid player.
   */
  socket.on('shuffle', function() {
    // state machine filter
    if(!game_manager.state_machine('shuffle', ip)){
      io.to(socket.id).emit('server message', "Action not allowed.");
      return;
    }
    
    // valid player filter
    if(game_manager.validate_player(ip)) {
      io.to(socket.id).emit('server message', "You must enter your player info before beginning the game.");
      return;
    }
    game_manager.board.shuffle_board();
    io.sockets.emit('update board', game_manager.board.tiles);
    update_clients();
  });

  /**
   * move the game into the 'placement'
   * state if the game state machine allows it and
   * if the message comes from a valid player.
   */
  socket.on('start', function() {
    // state machine filter
    if(!game_manager.state_machine('start', ip)){
      io.to(socket.id).emit('server message', "Action not allowed.");
      return;
    }
    
    // valid player filter
    if(game_manager.validate_player(ip)) {
      io.to(socket.id).emit('server message', "You must enter your player info before beginning the game.");
      return;
    }
    io.sockets.emit('server message all clients', "The game has begun!");
    update_clients();
  });

  /**
   *  generate a new dice roll result
   * if the game state machine allows it and
   * if the message comes from a valid player.
   */
  socket.on('roll dice', function() {
    // state machine filter
    if(!game_manager.state_machine('roll dice', ip)){
      io.to(socket.id).emit('server message', "Action not allowed.");
      return;
    }
    
    // valid player filter
    if(game_manager.validate_player(ip)) {
      io.to(socket.id).emit('server message', "You must enter your player info before beginning the game.");
      return;
    }

    game_manager.roll_dice();
    game_manager.allocate_resources();

    // instruct clients to update dice roll on scoreboard
    io.sockets.emit('new dice roll', game_manager.dice);
    update_clients();
  });

  /**
   * increment the turn number
   * if the game state machine allows it and
   * if the message comes from a valid player.
   */
  socket.on('finish turn', function() {
    // state machine filter
    if(!game_manager.state_machine('finish turn', ip)){
      io.to(socket.id).emit('server message', "Action not allowed.");
      return;
    }
    
    // valid player filter
    if(game_manager.validate_player(ip)) {
      io.to(socket.id).emit('server message', "You must enter your player info before beginning the game.");
      return;
    }

    // inform all clients that this player has finished their turn
    io.sockets.emit('server message all clients', `${game_manager.players[ip].name} has finished their turn.`);
    
    // instruct clients to redraw scoreboard with new turn player
    for(let p_ip in game_manager.players) {
      if(game_manager.players[p_ip].player_number === game_manager.turn) {
        io.sockets.emit('next turn', game_manager.players[p_ip].name);
        break;
      } 
    }

    update_clients();
  });

  /**
   * instruct the client to enable road building
   * if the game state machine allows it and
   * if the message comes from a valid player.
   */
  socket.on('build road', function() {
    // state machine filter
    if(!game_manager.state_machine('build road', ip)){
      io.to(socket.id).emit('server message', "Action not allowed.");
      return;
    }
    
    // valid player filter
    if(game_manager.validate_player(ip)) {
      io.to(socket.id).emit('server message', "You must enter your player info before beginning the game.");
      return;
    }

    // send message to allow roads to appear on THIS player's screen
    // can only build road if they have the correct resources
    io.to(socket.id).emit('enable road building');
    update_clients();
  });

  /**
   * instruct the client to enable colony building
   * if the game state machine allows it and
   * if the message comes from a valid player.
   */
  socket.on('build colony', function() {
    // state machine filter
    if(!game_manager.state_machine('build colony', ip)){
      io.to(socket.id).emit('server message', "Action not allowed.");
      return;
    }
    
    // valid player filter
    if(game_manager.validate_player(ip)) {
      io.to(socket.id).emit('server message', "You must enter your player info before beginning the game.");
      return;
    }

    // send message to allow roads to appear on THIS player's screen
    // can only build road if they have the correct resources
    io.to(socket.id).emit('enable colony building');
    update_clients();
  });

  /**
   * instruct all clients to draw a new road at 
   * the given position and with this client's color
   * if the message comes from a valid player.
   * @param {Number} position
   */
  socket.on('place road', function(position) {
    // state machine filter
    if(!game_manager.state_machine('place road', ip)){
      io.to(socket.id).emit('server message', "Action not allowed.");
      return;
    }

    // valid player filter
    if(game_manager.validate_player(ip)) {
      io.to(socket.id).emit('server message', "You must enter your player info before beginning the game.");
      return;
    }

    // place new road 
    io.sockets.emit('new road', game_manager.place_road(position, ip));
    update_clients();
  });

  /**
   * instruct all clients to draw a new colony at 
   * the given position and with this client's color
   * if the message comes from a valid player.
   * @param {Number} position
   */
  socket.on('place colony', function(position) {
    // state machine filter
    if(!game_manager.state_machine('place colony', ip)){
      io.to(socket.id).emit('server message', "Action not allowed.");
      return;
    }

    // validate plauer filter
    if(game_manager.validate_player(ip)) {
      io.to(socket.id).emit('server message', "You must enter your player info before beginning the game.");
      return;
    }

    // place new colony 
    io.sockets.emit('new colony', game_manager.place_colony(position, ip));
    update_clients();
  });

  /**
   * create a new game_manager object to refresh 
   * the game for testing. 
   * TODO: implement this with redraw functions to allow
   * clients to replay after the game is over.
   */
  socket.on('new game', function() {
    console.log("FORCE NEW GAME");
    game_manager = game.get_new_game_manager();
  });

});

/**
 * send periodic instructions to players in game_room based on the state of the game
 */
let instruction_period = 5000; // every 5s
let instruction_number = 0;
setInterval(function() {
  // don't print on end game
  if(game_manager.state !== "end_game") {
    io.to(game_room).emit('game instructions', game_manager.player_instructions[game_manager.state][instruction_number]);
    // update instruciton number (loop through instruction set)
    if(instruction_number < game_manager.player_instructions[game_manager.state].length - 1) instruction_number++;
    else instruction_number = 0;
  }
}, instruction_period);

