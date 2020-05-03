// Class to hold player information.
class Player {
    /**
     * Player constructor.
     * @param {string} name 
     * @param {string} color 
     * @param {Number} player_num 
     */
    constructor(name, color, player_num) {
        this.player_number = player_num;
        this.name = name;
        this.color = color;
        this.score = 0;
        this.colonies = 5;
        this.cities = 4;
        this.roads = 15;
        this.dev_cards = 0;
        this.hand = {'wheat': 0, 'sheep': 0, 'brick': 0, 'wood': 0, 'ore': 0};
        this.num_cards = 0;
    }

    /**
     * Iterate over player hand and update total number of cards.
     */
    update_num_cards() {
        this.num_cards = 0;
        for(let resource in this.hand) {
            if(this.hand.hasOwnProperty(resource)) {
                this.num_cards += this.hand[resource];
            }
        }
    }

    /**
     * Calculate player score.
     */
    update_score() {
        this.score = 5 - this.colonies + 2 * (4 - this.cities);
    }
}

/**
 * Returns an instance of Player.
 */
exports.get_new_player = function(name, color, number) {
    return new Player(name, color, number);
}

// object to initialize board tiles
const _tiles = [                                          /* colony positions surrounding 
                                                        tile (clockwise from top) */
    {type: "wheat",   number: 2,    colony_positions:   [1,  2,  3,  4,  5,  6]},
    {type: "wheat",   number: 3,    colony_positions:   [2,  3,  7,  8,  9,  10]},
    {type: "wheat",   number: 3,    colony_positions:   [8,  9,  11, 12, 13, 14]},
    {type: "wheat",   number: 4,    colony_positions:   [5,  4,  15, 16, 17, 18]},
    {type: "sheep",   number: 4,    colony_positions:   [3,  10, 19, 20, 15, 4]},
    {type: "sheep",   number: 5,    colony_positions:   [9,  14, 21, 22, 19, 10]},
    {type: "sheep",   number: 5,    colony_positions:   [13, 23, 24, 25, 21, 14]},
    {type: "sheep",   number: 6,    colony_positions:   [17, 16, 26, 27, 28, 29]},
    {type: "ore",     number: 6,    colony_positions:   [15, 20, 30, 31, 26, 16]},
    {type: "ore",     number: 8,    colony_positions:   [19, 22, 32, 33, 30, 20]},
    {type: "ore",     number: 8,    colony_positions:   [21, 25, 34, 35, 32, 22]},
    {type: "brick",   number: 9,    colony_positions:   [24, 36, 37, 38, 34, 25]},
    {type: "brick",   number: 9,    colony_positions:   [26, 31, 39, 40, 41, 27]},
    {type: "brick",   number: 10,   colony_positions:   [30, 33, 42, 43, 39, 31]},
    {type: "wood",    number: 10,   colony_positions:   [32, 35, 44, 45, 42, 33]},
    {type: "wood",    number: 11,   colony_positions:   [34, 38, 46, 47, 44, 35]},
    {type: "wood",    number: 11,   colony_positions:   [39, 43, 48, 49, 50, 40]},
    {type: "wood",    number: 12,   colony_positions:   [42, 45, 51, 52, 48, 43]},
    {type: "desert",  number: 0,    colony_positions:   [44, 47, 53, 54, 51, 45]}
];

// Class to hold mutable information tile information.
class Tile {
    /**
     * Tile constructor.
     * @param {Object} _tile 
     */
    constructor (_tile) {
        this.type = _tile.type;
        this.number = _tile.number;
        this.colony_positions = _tile.colony_positions;
    }
}

// Class to hold board information.
class Board  {
    /**
     * Board constructor.
     */
    constructor() {
        // create an array of tiles
        this.tiles = [];
        for(let i = 0; i < _tiles.length; i++) {
            this.tiles[i] = new Tile(_tiles[i]);
        }
        
        // create an array of roads
        this.roads = []
        this.num_roads = 72;
        for(let i = 0; i < this.num_roads; i++) {
            this.roads.push({owner: 0, color: ""}); 
        }
        
        /**
         * TODO: can make this more efficient by keeping a dictionary of active colonies
         *      and updating it every time a player places a colony.
         */
        // initialize colonies
        this.colonies = [];
        this.num_colonies = 54;
        this.init_colonies();

        // variable to check if board has been generated (shuffled) yet
        this.is_shuffled = false;
    }

    /**
     * Initialize colonies with resource and number mapping.
     */
    init_colonies() {
        // create an array of colonies with boardering tiles
        this.colonies = []
        for(let i = 0; i < this.num_colonies; i++) {
            this.colonies.push({owner: 0, color: ""});
            this.colonies[i].tiles = {};
            for(let j = 0; j < this.tiles.length; j++) {
                if(this.tiles[j].colony_positions.includes(i + 1)) {
                    // add number and resource type to colony
                    if(typeof this.colonies[i].tiles[this.tiles[j].number] === "undefined") {
                        this.colonies[i].tiles[this.tiles[j].number] = [];
                    }
                    this.colonies[i].tiles[this.tiles[j].number].push(this.tiles[j].type);
                }
            }              
        }
    }

    /**
     * Shuffle numbers on board.
     */
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

    /**
     * Shuffle tiles on board.
     */
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

    /**
     * Place zero back on desert.
     */
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
    
    /**
     * Shuffle all board components and reinitialize colonies.
     */
    shuffle_board() {
        this.shuffle_numbers();
        this.shuffle_types();
        this.zero_desert();
        this.init_colonies();
        this.is_shuffled = true;
    }
}

/**
 * Returns an intance of Board
 */
exports.get_new_board = function() {
    return new Board();
}