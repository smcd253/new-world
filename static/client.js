// establish connection to server
// note: socketIO uses JSON.stringify() natively to send and receive any objects
let socket = io();

// connect to server
socket.emit('new client');

/********************** send server messages **************************/
function is_valid_color(color_string) {
    color_string = color_string.toLowerCase();
    let s = new Option().style;
    s.color = color_string;
    return (s.color == color_string);
}
// create or update player from player input fields
function get_player_info(event) {
  let name, color;
  let valid_player_info = false;
  if(typeof event !== "undefined") {
    if(event.keyCode === 13) {
      name = document.getElementById("player_name").value;
      color = document.getElementById("player_color").value;
      valid_player_info = true;
    }
  }
  else {
    name = document.getElementById("player_name").value;
    color = document.getElementById("player_color").value;
    valid_player_info = true;
  }

  if(valid_player_info) {
    if(is_valid_color(color)){
      // send server message: 'new player' and new player info when a new connection (this script) is formed
      socket.emit('new player', name, color);
    }
    else{
      print_message("Please enter a valid color.")
    }
  }
}

// send server message 'shuffle' when a client presses "Shuffle Board"
async function shuffle_board() {
  socket.emit('shuffle');
}

// send server message 'start' when a client presses "Start Game"
async function start_game() {
  socket.emit('start');
}

// send server message 'roll dice' when a client presses "Roll Dice"
async function roll_dice() {
  socket.emit('roll dice');
}

// send server message 'finish turn' when a client presses "Finish Turn"
async function finish_turn() {
  socket.emit('finish turn');
}

// send server message 'build road' when client presses "Build Road"
async function build_road() {
  socket.emit('build road');
}

// send server message 'build road' when client presses "Build Road"
// nice
async function build_colony() {
  socket.emit('build colony');
}

// send server message 'place road' when a client presses a button corrsponding to road at position pos
async function place_road(pos) {
  socket.emit('place road', pos);
}

// send server message 'place colony' when a client presses a button corrsponding to colony at position pos
async function place_colony(pos) {
  socket.emit('place colony', pos);
}

/********************** server messages **************************/
async function print_message(msg) {
  document.getElementsByClassName("msg_board")[0].textContent = msg;
}

// debug print
socket.on('server message', async function(data) {
  console.log("------------------------- Message -------------------------")
  console.log(data);
  print_message(data);
});

/********************** update player menu **************************/
socket.on('update player menu', async function(player) {
  // update name and color
  document.getElementsByClassName("player_info_name")[0].textContent = "Name: " + player.name;
  document.getElementsByClassName("player_info_color")[0].textContent = "Color: " + player.color;
  // update hand
  document.getElementsByClassName("player_hand_wood")[0].textContent = "Wood: " + player.hand["wood"];
  document.getElementsByClassName("player_hand_brick")[0].textContent = "Brick: " + player.hand["brick"];
  document.getElementsByClassName("player_hand_wheat")[0].textContent = "Wheat: " + player.hand["wheat"];
  document.getElementsByClassName("player_hand_sheep")[0].textContent = "Sheep: " + player.hand["sheep"];
  document.getElementsByClassName("player_hand_ore")[0].textContent = "Ore: " + player.hand["ore"];

  // update number of structures left
  document.getElementsByClassName("player_roads")[0].textContent = "Roads: " + player.roads;
  document.getElementsByClassName("player_colonies")[0].textContent = "Colonies: " + player.colonies;
  document.getElementsByClassName("player_cities")[0].textContent = "Cities: " + player.cities;

});

/********************** update scoreboard **************************/
// update scoreboard
// TODO: include function to update player score and num cards with every move
socket.on('update scoreboard', async function(players) {
  // get scoreboard data
  let scoreboard_names = document.getElementsByClassName("player_scoreboard_name");
  let scoreboard_colors = document.getElementsByClassName("player_scoreboard_color");
  let scoreboard_num_cards = document.getElementsByClassName("player_scoreboard_num_cards");
  let scoreboard_score = document.getElementsByClassName("player_scoreboard_score");

  // iterate through player object
  let i = 0;
  for(let ip in players) {
    if(players.hasOwnProperty(ip)) {
      scoreboard_names[i].textContent = "Name: " + players[ip].name;
      scoreboard_colors[i].textContent = "Color: " + players[ip].color;
      scoreboard_num_cards[i].textContent = "Num Cards: " + players[ip].num_cards;
      scoreboard_score[i].textContent = "Score: " + players[ip].score;
      i++;
    }
  }
});

socket.on('new dice roll', async function(dice) {
  document.getElementsByClassName("turn_info_dice")[0].textContent = "Dice Roll = " + dice;
});

socket.on('next turn', async function(player_name) {
  document.getElementsByClassName("turn_info_turn")[0].textContent = player_name + "'s turn";
})
/********************** update board **************************/

// receive new state from server, draw new components
socket.on('update board', async function(new_board) {
  draw_new_board(new_board);
});

async function draw_new_board(new_board) {
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

// bring layer forward so we can interact with it
async function bring_element_forward(element) {
  let container = document.getElementsByClassName(element)[0];
  container.style.zIndex = z_indices["front"];
}
// bring layer back
async function bring_element_back(element) {
  let container = document.getElementsByClassName(element)[0];
  container.style.zIndex = z_indices[element];
}

/************************** Road Building ****************************/
// turn road buttons visibility on or off
async function toggle_road_buttons(_visibility) {
  let road_buttons = document.getElementsByClassName("road_button_click");
  for(let r of road_buttons) {
    r.style.visibility = _visibility;
  }
}

// receive enable road building, set all road buttons to visible
socket.on('enable road building', async function() {
  bring_element_forward("road_buttons");
  toggle_road_buttons("visible");
});

// receive new state from server, draw new components
socket.on('new road', async function(new_road) {
  bring_element_back("road_buttons");
  toggle_road_buttons("hidden");

  if (typeof new_road.data !== "undefined") {
    draw_new_road(new_road.data);
  } 
  print_message(new_road.msg);
});

async function draw_new_road(new_road) {
  // draw new road
  let roads_container = document.getElementsByClassName("roads")[0];
  let roads = roads_container.querySelectorAll('*[id]:not([id=""]');
  console.log(new_road.position)
  let road_to_draw = roads[new_road.position];
  console.log(road_to_draw);
  road_to_draw.style.background = new_road.color;
  road_to_draw.style.visibility = "visible";
}

socket.on('out of roads', async function(msg) {
  bring_element_back("road_buttons");
  toggle_road_buttons("hidden");
  console.log(msg);
});

/************************** Colony Building ****************************/
// turn colony buttons visibility on or off
async function toggle_colony_buttons(_visibility) {
  let colony_buttons = document.getElementsByClassName("colony_button_click");
  for(let c of colony_buttons) {
    c.style.visibility = _visibility;
  }
}

// receive enable colony building, set all road buttons to visible
socket.on('enable colony building', async function() {
  bring_element_forward("colony_buttons");
  toggle_colony_buttons("visible");
});

// receive new state from server, draw new components
socket.on('new colony', async function(new_colony) {
  bring_element_back("colony_buttons");
  toggle_colony_buttons("hidden");

  if (typeof new_colony.data !== "undefined") {
    draw_new_colony(new_colony.data);
  }

  print_message(new_colony.msg);
});

  // draw new colony
async function draw_new_colony(new_colony) {
  let colonies_container = document.getElementsByClassName("colonies")[0];
  let colonies = colonies_container.querySelectorAll('*[id]:not([id=""])');
  // console.log("DRAW_NEW_COLONY(): at" + new_colony.position);
  let colony_to_draw = colonies[new_colony.position];
  colony_to_draw.style.setProperty('--custom-color', new_colony.color);
  colony_to_draw.style.visibility = "visible";
}

socket.on('out of colonies', function(msg) {
  bring_element_back("colony_buttons");
  toggle_colony_buttons("hidden");
  console.log(msg);
});


/************************** Update Structures ****************************/
// case: client out of sync, receive update to update resources
socket.on('update structure', async function(structure) {
  console.log("UPDATE_STRUCTURE(): CALLED");
  if(typeof structure !== "undefined"){
    console.log("UPDATE_STRUCTURE(): structure defined");
    
    if(structure.type === "road"){
      if (typeof structure.data !== "undefined") {
        draw_new_road(structure.data);
      } 
    }
    else if(structure.type === "colony") {
      if (typeof structure.data !== "undefined") {
        draw_new_colony(structure.data);
        console.log("UPDATE_STRUCTURE(): new colony at position " + structure.data.position);
      } 
    }
  }
});
