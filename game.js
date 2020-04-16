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
    constructor(name, color) {
        this.player_number = -1;
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

exports.new_player = function(name, color) {
    return new Player(name, color);
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

class Board {
    constructor() {
        // create an array of tiles
        this.tiles = [];
        for(let i = 0; i < _tiles.length; i++) {
            this.tiles[i] = new Tile(_tiles[i]);
        }
    }
}


exports.get_board = function() {
    return new Board();
}