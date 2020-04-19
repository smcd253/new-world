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
  let tiles = document.getElementsByClassName("hex")
  console.log(tiles)
  let i = 0
  for (let i = 0; i < tiles.length; i++) {
    circle = tiles[i].getElementsByTagName("circle")[0];
    tile_image = tiles[i].getElementsByClassName("hexIn")[0].getElementsByClassName("hexLink")[0].getElementsByTagName("img")[0];
    console.log(tile_image.src);
    if(layout[i].type === "desert") {
      tile_image.src = "./images/desert.jpeg";
      circle.style.visibility = "hidden";
    }
    else {
      if(layout[i].type === "wheat") {
        tile_image.src = "./images/wheat.jpg";
      }
      else if(layout[i].type === "sheep") {
        tile_image.src = "./images/sheep.jpg";
      }
      else if(layout[i].type === "ore") {
        tile_image.src = "./images/ore.jpg";
      }
      else if(layout[i].type === "brick") {
        tile_image.src = "./images/brick.jpg";
      }
      else if(layout[i].type === "wood") {
        tile_image.src = "./images/wood.jpeg";
      }
      circle.style.visibility = "visible";
      circle.textContent = layout[i].number;
    }
  }
}