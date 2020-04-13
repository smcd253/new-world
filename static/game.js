let socket = io();
socket.on('message', function(data) {
  console.log(data);
});

let movement = {
    up: false,
    down: false,
    left: false,
    right: false
  }
document.addEventListener('keydown', function(event) {
  let tiles = document.getElementsByClassName("hexagon")
  let num = 10
  
  switch (event.keyCode) {
    case 65: // A
      movement.left = true;
      // for (let tile of tiles) {
      //   tile.style.top = 0;
      //   tile.style.left = 0;
      //   console.log(tile);
      // }
      break;
      case 87: // W
      movement.up = true;
      break;
    case 68: // D
      movement.right = true;
      // for (let tile of tiles) {
      //   let str_num = num.toString(10);
      //   let px = str_num.concat("px");
      //   tile.style.top = px;
      //   tile.style.left = px;
      //   num += 50;
      //   console.log(px)
      //   console.log(tile);
      // }
      break;
      case 83: // S
      movement.down = true;
      break;
  }
  
});
document.addEventListener('keyup', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = false;
      break;
    case 87: // W
      movement.up = false;
      break;
    case 68: // D
      movement.right = false;
      break;
    case 83: // S
      movement.down = false;
      break;
  }
});

socket.emit('new player');
setInterval(function() {
  socket.emit('movement', movement);
}, 1000 / 60);


// let canvas = document.getElementById('canvas');
// canvas.width = 800;
// canvas.height = 600;
// let context = canvas.getContext('2d');

// socket.on('state', function(players) {
//   context.clearRect(0, 0, 800, 600);
//   context.fillStyle = 'green';
//   for (let id in players) {
//     let player = players[id];
//     context.beginPath();
//     context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
//     context.fill();
//   }
// });

// define position of tiles (from bottom right to top left)
let tile_posiitons = [
  // line 1
  {name: "tile1", top: "200px", left: "400px"},
  {name: "tile2", top: "200px", left: "640px"},
  {name: "tile3", top: "200px", left: "880px"},
  // line 2
  {name: "tile4", top: "405px", left: "280px"},
  {name: "tile5", top: "405px", left: "520px"},
  {name: "tile6", top: "405px", left: "760px"},
  {name: "tile7", top: "405px", left: "1000px"},
  // line 3
  {name: "tile8", top:  "610px", left: "160px"},
  {name: "tile9", top:  "610px", left: "400px"},
  {name: "tile10", top: "610px", left: "640px"},
  {name: "tile11", top: "610px", left: "880px"},
  {name: "tile12", top: "610px", left: "1120px"},
  // line 4
  {name: "tile13", top: "815px", left: "280px"},
  {name: "tile14", top: "815px", left: "520px"},
  {name: "tile15", top: "815px", left: "760px"},
  {name: "tile16", top: "815px", left: "1000px"},
  // line 5
  {name: "tile17", top: "1020px", left: "400px"},
  {name: "tile18", top: "1020px", left: "640px"},
  {name: "tile19", top: "1020px", left: "880px"},
];

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

// src: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle_board() {
  let rand_tile_pos = shuffle(tile_posiitons);
  let tiles = document.getElementsByClassName("hexagon")
  let i = 0
  for (let tile of tiles) {
    tile.style.top = rand_tile_pos[i].top;
    tile.style.left = rand_tile_pos[i].left;
    i++;
  }
}
