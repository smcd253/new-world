// establish connection to server
// note: socketIO uses JSON.stringify() natively to send and receive any objects
let socket = io();

// connect to server
socket.emit('new client');

/********************** send server messages **************************/

// create or update player from player input fields
function get_player_info(event) {
  let name, color;
  console.log(event);
  if(typeof event !== "undefined") {
    if(event.keyCode === 13) {
      name = document.getElementById("player_name").value;
      color = document.getElementById("player_color").value;
      // send server message: 'new player' and new player info when a new connection (this script) is formed
      socket.emit('new player', name, color);
    }
  }
  else {
    name = document.getElementById("player_name").value;
    color = document.getElementById("player_color").value;
    // send server message: 'new player' and new player info when a new connection (this script) is formed
    socket.emit('new player', name, color);
  }
}

// send server message 'shuffle' when a client presses "Shuffle Board"
function shuffle_board() {
  socket.emit('shuffle');
}

// send server message 'start' when a client presses "Start Game"
function start_game() {
  socket.emit('start');
}

// send server message 'roll dice' when a client presses "Roll Dice"
function roll_dice() {
  socket.emit('roll dice');
}

// send server message 'build road' when client presses "Build Road"
function build_road() {
  socket.emit('build road');
}

// send server message 'build road' when client presses "Build Road"
function build_colony() {
  socket.emit('build colony');
}

// send server message 'place road' when a client presses a button corrsponding to road at position pos
function place_road(pos) {
  socket.emit('place road', pos);
}

// send server message 'place colony' when a client presses a button corrsponding to colony at position pos
function place_colony(pos) {
  socket.emit('place colony', pos);
}

// debug print
socket.on('debug', function(data) {
  console.log("------------------------- Server Debug Msg -------------------------")
  console.log(data);
  document.getElementsByClassName("msg_board")[0].textContent = data;
});

/********************** update scoreboard **************************/
// update scoreboard
// TODO: include function to update player score and num cards with every move
socket.on('update scoreboard', function(players) {
  // get scoreboard data
  let scoreboard_names = document.getElementsByClassName("player_info_name");
  let scoreboard_colors = document.getElementsByClassName("player_info_color");
  let scoreboard_num_cards = document.getElementsByClassName("player_info_num_cards");
  let scoreboard_score = document.getElementsByClassName("player_info_score");

  // iterate through player object
  let i = 0;
  for(let player in players) {
    if(players.hasOwnProperty(player)) {
      scoreboard_names[i].textContent = "Name: " + players[player].name;
      scoreboard_colors[i].textContent = "Color: " + players[player].color;
      scoreboard_num_cards[i].textContent = "Num Cards: " + players[player].num_cards;
      scoreboard_score[i].textContent = "Score: " + players[player].points_visible;
      i++;
    }
  }
});

socket.on('new dice roll', function(dice) {
  document.getElementsByClassName("turn_info_dice")[0].textContent = "Dice Roll = " + dice;
});
/********************** update board **************************/

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

/********************** z-index manipulation **************************/
let z_indices = {
  "board": "-1",
  "roads": "1",  
  "colonies": "1",  
  "cities": "1",
  "road_buttons": "2",
  "colony_buttons": "2",  
  "city_buttons": "2",
  "front": "50",
  "player": "100",  
};

// function to bring layer forward so we can interact with it
function bring_element_forward(element) {
  let container = document.getElementsByClassName(element)[0];
  container.style.zIndex = z_indices["front"];
}
function bring_element_back(element) {
  let container = document.getElementsByClassName(element)[0];
  container.style.zIndex = z_indices[element];
}

/************************** Road Building ****************************/
// turn road buttons visibility on or off
function toggle_road_buttons(_visibility) {
  let road_buttons = document.getElementsByClassName("road_button_click");
  for(let r of road_buttons) {
    r.style.visibility = _visibility;
  }
}

// receive enable road building, set all road buttons to visible
socket.on('enable road building', function() {
  bring_element_forward("road_buttons");
  toggle_road_buttons("visible");
});

// receive new state from server, draw new components
socket.on('new road', function(new_road) {
  bring_element_back("road_buttons");
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
  bring_element_back("road_buttons");
  toggle_road_buttons("hidden");
  console.log(msg);
});

/************************** Colony Building ****************************/
// turn colony buttons visibility on or off
function toggle_colony_buttons(_visibility) {
  let colony_buttons = document.getElementsByClassName("colony_button_click");
  for(let c of colony_buttons) {
    c.style.visibility = _visibility;
  }
}

// receive enable colony building, set all road buttons to visible
socket.on('enable colony building', function() {
  bring_element_forward("colony_buttons");
  toggle_colony_buttons("visible");
});

// receive new state from server, draw new components
socket.on('new colony', function(new_colony) {
  bring_element_back("colony_buttons");
  draw_new_colony(new_colony);
  toggle_colony_buttons("hidden");
});

  // draw new colony
function draw_new_colony(new_colony) {
  let colonies_container = document.getElementsByClassName("colonies")[0];
  let colonies = colonies_container.querySelectorAll('*[id]:not([id="colonyGrid"])');
  console.log(new_colony.position)
  let colony_to_draw = colonies[new_colony.position];
  console.log(colony_to_draw);
  colony_to_draw.style.setProperty('--custom-color', new_colony.color);
  colony_to_draw.style.visibility = "visible";
}

socket.on('out of colonies', function(msg) {
  bring_element_back("colony_buttons");
  toggle_colony_buttons("hidden");
  console.log(msg);
});

function expose_col_num() {
  let expose_colonies = document.getElementsByClassName("colonies")[0];
  console.log(expose_colonies);
  let col = expose_colonies.querySelectorAll('*[id]:not([id="colonyGrid"]');
  for(let i = 0; i < col.length; i++) {
    col[i].style.visibility = "visible";
    col[i].textContent = col[i].id.slice(1).slice(-2);
    col[i].style.background = "black";
  }
}
