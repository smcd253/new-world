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

exports.new_player = function(name, color, player_num) {
    return new Player(name, color, player_num);
}

// object to initialize board tiles
let _tiles = [
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
    {name: "desert",  type: "desert",  number: 0},
];

class Tile {
    constructor (_tile) {
        this.name = _tile.name;
        this.type = _tile.type;
        this.number = _tile.number;
    }
}


let roads = [
    {position: 1, owner: "null"},
    {position: 2, owner: "null"},
    {position: 3, owner: "null"},
    {position: 4, owner: "null"},
    {position: 5, owner: "null"},
    {position: 6, owner: "null"},
    {position: 7, owner: "null"},
    {position: 8, owner: "null"},
    {position: 9, owner: "null"},
    {position: 10, owner: "null"},
    {position: 11, owner: "null"},
    {position: 12, owner: "null"},
    {position: 13, owner: "null"},
    {position: 14, owner: "null"},
    {position: 15, owner: "null"},
    {position: 16, owner: "null"},
    {position: 17, owner: "null"},
    {position: 18, owner: "null"},
    {position: 19, owner: "null"},
    {position: 20, owner: "null"},
    {position: 21, owner: "null"},
    {position: 22, owner: "null"},
    {position: 23, owner: "null"},
    {position: 24, owner: "null"},
    {position: 25, owner: "null"},
    {position: 26, owner: "null"},
    {position: 27, owner: "null"},
    {position: 28, owner: "null"},
    {position: 29, owner: "null"},
    {position: 30, owner: "null"},
    {position: 31, owner: "null"},
    {position: 32, owner: "null"},
    {position: 33, owner: "null"},
    {position: 34, owner: "null"},
    {position: 35, owner: "null"},
    {position: 36, owner: "null"},
    {position: 37, owner: "null"},
    {position: 38, owner: "null"},
    {position: 39, owner: "null"},
    {position: 40, owner: "null"},
    {position: 41, owner: "null"},
    {position: 42, owner: "null"},
    {position: 43, owner: "null"},
    {position: 44, owner: "null"},
    {position: 45, owner: "null"},
    {position: 46, owner: "null"},
    {position: 47, owner: "null"},
    {position: 48, owner: "null"},
    {position: 49, owner: "null"},
    {position: 50, owner: "null"},
    {position: 51, owner: "null"},
    {position: 52, owner: "null"},
    {position: 53, owner: "null"},
    {position: 54, owner: "null"},
    {position: 55, owner: "null"},
    {position: 56, owner: "null"},
    {position: 57, owner: "null"},
    {position: 58, owner: "null"},
    {position: 59, owner: "null"},
    {position: 60, owner: "null"},
    {position: 61, owner: "null"},
    {position: 62, owner: "null"},
    {position: 63, owner: "null"},
    {position: 64, owner: "null"},
    {position: 65, owner: "null"},
    {position: 66, owner: "null"},
    {position: 67, owner: "null"},
    {position: 68, owner: "null"},
    {position: 69, owner: "null"},
    {position: 70, owner: "null"},
    {position: 71, owner: "null"},
    {position: 72, owner: "null"},
    {position: 73, owner: "null"},
];

exports.get_roads = function() {
    return roads;
}

class Board {
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
    }
    shuffle_numbers() {
        let currentIndex = this.tiles.length, temp, randomIndex;
      
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            while (this.tiles[randomIndex].type === "desert")
            {
                randomIndex = Math.floor(Math.random() * currentIndex);
            }
            if (this.tiles[currentIndex].type !== "desert")
            {
                temp = this.tiles[currentIndex].number;
                this.tiles[currentIndex].number = this.tiles[randomIndex].number;
                this.tiles[randomIndex].number = temp;
            }
        }
    }
    shuffle_tiles() {
        let currentIndex = this.tiles.length, temp, randomIndex;
      
        while (0 !== currentIndex) {
      
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
        
            temp = this.tiles[currentIndex];
            this.tiles[currentIndex] = this.tiles[randomIndex];
            this.tiles[randomIndex] = temp;
        }
    }
}

exports.get_board = function() {
    return new Board();
}