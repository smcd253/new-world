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
const game = require("./public/game/game.js");

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

  // player's hand
class Hand {
  constructor() {
    this.total = 0;
    let wheat = 0;
    let sheep = 0;
    let ore = 0;
    let brick = 0;
    let wood = 0;
  }
  
  get_wheat() {
    return this.wheat;
  }

  get_sheep() {
    return this.sheep;
  }

  get_ore() {
    return this.ore;
  }

  get_brick() {
    return this.brick;
  }

  get_wood() {
    return this.wood;
  }
}
  
// player info
class Player {
  constructor(name, color) {
      this.player_number = -1;
      this.name = name;
      this.color = color;
      this.points_visible = 0;
      let points_actual = 0; // + vp dev_cards
      this.settlements = 5;
      this.cities = 4;
      this.roads = 15;
      this.dev_cards = 0;
      this.hand = new Hand();
  }

  get_points_actual() {
      return this.points_actual;
  }
}

// all players
let players = {};

// server board object
let board = [
  {name: "wheat1",  type: "wheat",  number: 2},
  {name: "wheat2",  type: "wheat",  number: 3},
  {name: "wheat3",  type: "wheat",  number: 3},
  {name: "wheat4",  type: "wheat",  number: 4},
  {name: "sheep1",  type: "sheep",  number: 4},
  {name: "sheep2",  type: "sheep",  number: 5},
  {name: "sheep3",  type: "sheep",  number: 5},
  {name: "sheep4",  type: "sheep",  number: 6},
  {name: "ore1",    type: "ore",    number: 6},
  {name: "ore2",    type: "ore",    number: 8},
  {name: "ore3",    type: "ore",    number: 8},
  {name: "brick1",  type: "brick",  number: 9},
  {name: "brick2",  type: "brick",  number: 9},
  {name: "brick3",  type: "brick",  number: 10},
  {name: "wood1",   type: "wood",   number: 10},
  {name: "wood2",   type: "wood",   number: 11},
  {name: "wood3",   type: "wood",   number: 11},
  {name: "wood4",   type: "wood",   number: 12},
  {name: "desert",  type: "wheat",  number: 0},
];

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

  return array;
}


// every time a request is made
io.on('connection', function(socket) {
  // if it is a new player (new instance of game.js)
  socket.on('new player', function(name, color) {
    if(players.length < 4) {
      io.sockets.emit('debug', socket.id);
      players[socket.id] = new Player(name, color);
      io.sockets.emit(players[socket.id])
    }
  });

  // if message is "shuffle"
  socket.on('shuffle', function() {
    board = shuffle(board);
    io.sockets.emit('state', board);
  });
});

// send state of all players back to all connections
// setInterval(function() {
//     io.sockets.emit('state', players);
//   }, 1000 / 60);

