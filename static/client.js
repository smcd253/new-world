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


// send server message 'shuffle' when a client presses "Shuffle Board"
function shuffle_board() {
  socket.emit('shuffle');
}

// send server message 'build road' when client presses "Build Road"
function build_road() {
  socket.emit('build road');
}
// send server message 'place road' when a client presses a button corrsponding to road at position pos
function place_road(pos) {
  socket.emit('place road', pos);
}

// player input fields
function get_player_info() {
  let name = document.getElementById("player_name").value;
  let color = document.getElementById("player_color").value;

  // send server message: 'new player' and new player info when a new connection (this script) is formed
  socket.emit('new player', name, color);
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

function toggle_road_buttons(_visibility) {
  let road_buttons = document.getElementsByClassName("road_button_click");
  for(let r of road_buttons) {
    r.style.visibility = _visibility;
  }
}

// receive enable road building, set all road buttons to visible
socket.on('enable road building', function() {
  toggle_road_buttons("visible");
});

// receive new state from server, draw new components
socket.on('new road', function(new_road) {
  draw_new_road(new_road);
  toggle_road_buttons("hidden");
});

function draw_new_road(new_road) {
  // draw new road
  let roads_container = document.getElementsByClassName("roads")[0];
  let roads = roads_container.querySelectorAll('*[id]:not([id=""]');
  console.log(new_road.position)
  let road_to_draw = roads[new_road.position];
  console.log(road_to_draw);
  road_to_draw.style.background = new_road.color;
  road_to_draw.style.visibility = "visible";
}

socket.on('out of roads', function(msg) {
  console.log(msg);
});