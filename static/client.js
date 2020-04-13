// establish connection to server
let socket = io();

// log any messages from server
socket.on('message', function(data) {
  console.log(data);
});

// send server message: 'new player' when a new connection (this script) is formed
socket.emit('new player');

// client board object
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

// send server message 'shuffle' when a client presses "Shuffle Board"
function shuffle_board() {
  socket.emit('shuffle');
}

// send new position to server every 1/60th of a second
// setInterval(function() {
//   socket.emit('movement', movement);
// }, 1000 / 60);

// debug print
socket.on('debug', function(data) {
  console.log(data);
});

// receive new state from server, draw new components
socket.on('state', function(new_board) {
  board = new_board
  draw_new_board();
});

function draw_new_board() {
  console.log("drawing new board")
  let tiles = document.getElementsByClassName("hexagon")
  let i = 0
  for (let i = 0; i < tiles.length; i++) {
    if(board[i].type === "wheat") {
      tiles[i].style.backgroundImage = "url('../images/wheat.jpg')";
    }
    else if(board[i].type === "sheep") {
      tiles[i].style.backgroundImage = "url('../images/sheep.jpg')";
    }
    else if(board[i].type === "ore") {
      tiles[i].style.backgroundImage = "url('../images/ore.jpg')";
    }
    else if(board[i].type === "brick") {
      tiles[i].style.backgroundImage = "url('../images/brick.jpeg')";
    }
    else if(board[i].type === "wood") {
      tiles[i].style.backgroundImage = "url('../images/wood.jpeg')";
    }
    else if(board[i].type === "desert") {
      tiles[i].style.backgroundImage = "url('../images/desert.jpeg')";
    }
  }
}