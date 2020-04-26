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
    constructor(name, color, player_num) {
        this.player_number = player_num;
        console.log
        this.name = name;
        this.color = color;
        this.points_visible = 0;
        let points_actual = 0; // + vp dev_cards
        this.colonies = 5;
        this.cities = 4;
        this.roads = 15;
        this.dev_cards = 0;
        this.hand = new Hand();
    }

    get_points_actual() {
        return this.points_actual;
    }
}

exports.new_player = function(name, color, player_num) {
    return new Player(name, color, player_num);
}

// object to initialize board tiles
let _tiles = [
    {type: "wheat",  number: 2},
    {type: "wheat",  number: 3},
    {type: "wheat",  number: 3},
    {type: "wheat",  number: 4},
    {type: "sheep",  number: 4},
    {type: "sheep",  number: 5},
    {type: "sheep",  number: 5},
    {type: "sheep",  number: 6},
    {type: "ore",    number: 6},
    {type: "ore",    number: 8},
    {type: "ore",    number: 8},
    {type: "brick",  number: 9},
    {type: "brick",  number: 9},
    {type: "brick",  number: 10},
    {type: "wood",   number: 10},
    {type: "wood",   number: 11},
    {type: "wood",   number: 11},
    {type: "wood",   number: 12},
    {type: "desert",  number: 0},
];

class Tile {
    constructor (_tile) {
        this.type = _tile.type;
        this.number = _tile.number;
    }
}

class Board  {
    constructor() {
        // create an array of tiles
        this.tiles = [];
        for(let i = 0; i < _tiles.length; i++) {
            this.tiles[i] = new Tile(_tiles[i]);
        }
        
        // create an array of roads
        this.roads = []
        for(let i = 1; i <= 72; i++) {
            this.roads.position = i;
            this.roads.owner = "null";
        }

        // create an array of colonies
        this.colonies = []
        for(let i = 1; i <= 59; i++) {
            this.colonies.position = i;
            this.colonies.owner = "null";   
        }

        // dice roll result
        this.dice = 0;
    }

    // shuffle numbers on board
    shuffle_numbers() {
        let currentIndex = this.tiles.length, temp, randomIndex;
      
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            temp = this.tiles[currentIndex].number;
            this.tiles[currentIndex].number = this.tiles[randomIndex].number;
            this.tiles[randomIndex].number = temp;
        
        }
    }

    // shuffle tiles on board
    shuffle_types() {
        let currentIndex = this.tiles.length, temp, randomIndex;
      
        while (0 !== currentIndex) {
      
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
        
            let temp_type = this.tiles[currentIndex].type;
            this.tiles[currentIndex].type = this.tiles[randomIndex].type;
            this.tiles[randomIndex].type = temp_type;
        }
    }

    // put zero back on desert
    zero_desert() {
        for(let i = 0; i < this.tiles.length; i++) {
            if(this.tiles[i].number === 0) {
                let zero = this.tiles[i].number;
                for(let j = 0; j < this.tiles.length; j++) {
                    if(this.tiles[j].type === "desert") {
                        this.tiles[i].number = this.tiles[j].number;
                        this.tiles[j].number = zero;
                        return;
                    }
                }
            }
        }
    }
    // shuffle everything
    shuffle_board() {
        this.shuffle_numbers();
        this.shuffle_types();
        this.zero_desert();
    }

    // roll dice
    roll_dice() {
        let min = 2;
        let max = 12;
        this.dice = Math.floor(Math.random() * (max - min + 1)) + min; ;
    }
}

exports.get_board = function() {
    return new Board();
}

// on object to run the game state machine and keep track of all game objects
class GameManager {
    constructor() {
        this.board = new Board();
        this.players = {}
        this.game_states = {
            "registration": {next_state: "game_setup"},
            "game_setup": {next_state: "play_game"},
            "play_game": {next_state: "end_game"},
            "end_game": {next_state: "registration"}
        }
        this.turn = {} /* populated in new_player() */
        this.state="registration";
    }

    // new player
    new_player(name, color, ip) {
        this.players[ip] = new_player(name, color, ip);
    }

    // update player
    update_player(name, color, ip) {
        this.players[ip].name = name;
        this.players[ip].color = color;
    }

    // start game
    // 
}