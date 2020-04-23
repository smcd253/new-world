// establish connection to server
// note: socketIO uses JSON.stringify() natively to send and receive any objects
let socket = io();

// log any messages from server
socket.on('message', function(data) {
  console.log(data);
});


// create new player
let name = "Spencer"; // TODO: source this from html
let color = "black"; // TODO: source this from html

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
// send server message 'place road' when a client presses "Place Road"
function place_road(pos) {
  socket.emit('place road', pos);
}

// debug print
socket.on('debug', function(data) {
  console.log("------------------------- Server Debug Msg -------------------------")
  console.log(data);
});

// receive new state from server, draw new components
socket.on('state', function(new_board) {
  draw_new_board(new_board);
});


function draw_new_board(new_board) {
  let tiles = document.getElementsByClassName("hex")
  console.log(tiles)
  let i = 0
  for (let i = 0; i < tiles.length; i++) {
    circle = tiles[i].getElementsByTagName("circle")[0];
    tile_image = tiles[i].getElementsByClassName("hexRhombus")[0].getElementsByClassName("hexRectangle")[0].getElementsByTagName("img")[0];
    console.log(tile_image.src);
    if(new_board[i].type === "desert") {
      tile_image.src = "./images/desert.jpeg";
      circle.style.visibility = "hidden";
    }
    else {
      if(new_board[i].type === "wheat") {
        tile_image.src = "./images/wheat.jpg";
      }
      else if(new_board[i].type === "sheep") {
        tile_image.src = "./images/sheep.jpg";
      }
      else if(new_board[i].type === "ore") {
        tile_image.src = "./images/ore.jpg";
      }
      else if(new_board[i].type === "brick") {
        tile_image.src = "./images/brick.jpg";
      }
      else if(new_board[i].type === "wood") {
        tile_image.src = "./images/wood.jpeg";
      }
      circle.style.visibility = "visible";
      circle.textContent = new_board[i].number;
    }
  }
}

// receive new state from server, draw new components
socket.on('new road', function(new_road) {
  draw_new_road(new_road);
});

function draw_new_road(new_road) {
  let roads_container = document.getElementsByClassName("roads")[0];
  let roads = roads_container.querySelectorAll('*[id]:not([id=""]');
  console.log(new_road.position)
  let road_to_draw = roads[new_road.position];
  console.log(road_to_draw);
  road_to_draw.style.background = new_road.color;
  road_to_draw.style.visibility = "visible";
}