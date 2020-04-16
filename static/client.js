// establish connection to server
// note: socketIO uses JSON.stringify() natively to send and receive any objects
let socket = io();

// log any messages from server
socket.on('message', function(data) {
  console.log(data);
});


// create new player
let name = "Spencer"; // TODO: source this from html
let color = "Blue"; // TODO: source this from html

// send server message: 'new player' and new player info when a new connection (this script) is formed
socket.emit('new player', name, color);

// create client instance of player
// my_player = new Player(name, color);

// callback to update player socket id
// socket.on("player number", function(socket_id) {
//   my_player.player_number = socket_id;
// });

// // debug
// console.log("client player instance")
// console.log(my_player)



// send server message 'shuffle' when a client presses "Shuffle Board"
function shuffle_board() {
  socket.emit('shuffle');
}

// debug print
socket.on('debug', function(data) {
  console.log("------------------------- Server Debug Msg -------------------------")
  console.log(data);
});

// receive new state from server, draw new components
socket.on('state', function(layout) {
  draw_new_board(layout);
});

function draw_new_board(layout) {
  console.log("drawing new board")
  let tiles = document.getElementsByClassName("hexagon")
  let i = 0
  for (let i = 0; i < tiles.length; i++) {
    if(layout[i].type === "desert") {
      tiles[i].style.backgroundImage = "url('../images/desert.jpeg')";
      tiles[i].getElementsByClassName("circle")[0].style.visibility = "hidden";
    }
    else {
      if(layout[i].type === "wheat") {
        tiles[i].style.backgroundImage = "url('../images/wheat.jpg')";
      }
      else if(layout[i].type === "sheep") {
        tiles[i].style.backgroundImage = "url('../images/sheep.jpg')";
      }
      else if(layout[i].type === "ore") {
        tiles[i].style.backgroundImage = "url('../images/ore.jpg')";
      }
      else if(layout[i].type === "brick") {
        tiles[i].style.backgroundImage = "url('../images/brick.jpeg')";
      }
      else if(layout[i].type === "wood") {
        tiles[i].style.backgroundImage = "url('../images/wood.jpeg')";
      }
      tiles[i].getElementsByClassName("circle")[0].style.visibility = "visible";
      tiles[i].getElementsByClassName("circle")[0].textContent = layout[i].number;
    }
  }
}