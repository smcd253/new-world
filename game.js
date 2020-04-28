
// player info
class Player {
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

    update_num_cards() {
        this.num_cards = 0;
        for(let resource in this.hand) {
            console.log("UPDATE_NUM_CARDS(): this.hand[resource] = " + this.hand[resource]);
            if(this.hand.hasOwnProperty(resource)) {
                this.num_cards += this.hand[resource];
            }
        }
        console.log("UPDATE_NUM_CARDS(): num cards = " + this.num_cards);
    }

    update_score() {
        this.score = 5 - this.colonies + 2 * (4 - this.cities);
    }
}

// object to initialize board tiles
let _tiles = [                                      /* colony positions surrounding tile (clockwise from top) */
    {type: "wheat",   number: 2,    colony_positions: [1,  2,  3,  4,  5,  6]},
    {type: "wheat",   number: 3,    colony_positions: [2,  3,  7,  8,  9,  10]},
    {type: "wheat",   number: 3,    colony_positions: [8,  9,  11, 12, 13, 14]},
    {type: "wheat",   number: 4,    colony_positions: [5,  4,  15, 16, 17, 18]},
    {type: "sheep",   number: 4,    colony_positions: [3,  10, 19, 20, 15, 4]},
    {type: "sheep",   number: 5,    colony_positions: [9,  14, 21, 22, 19, 10]},
    {type: "sheep",   number: 5,    colony_positions: [13, 23, 24, 25, 21, 14]},
    {type: "sheep",   number: 6,    colony_positions: [17, 16, 26, 27, 28, 29]},
    {type: "ore",     number: 6,    colony_positions: [15, 20, 30, 31, 26, 16]},
    {type: "ore",     number: 8,    colony_positions: [19, 22, 32, 33, 30, 20]},
    {type: "ore",     number: 8,    colony_positions: [21, 25, 34, 35, 32, 22]},
    {type: "brick",   number: 9,    colony_positions: [24, 36, 37, 38, 34, 25]},
    {type: "brick",   number: 9,    colony_positions: [26, 31, 39, 40, 41, 27]},
    {type: "brick",   number: 10,   colony_positions: [30, 33, 42, 43, 39, 31]},
    {type: "wood",    number: 10,   colony_positions: [32, 35, 44, 45, 42, 33]},
    {type: "wood",    number: 11,   colony_positions: [34, 38, 46, 47, 44, 35]},
    {type: "wood",    number: 11,   colony_positions: [39, 43, 48, 49, 50, 40]},
    {type: "wood",    number: 12,   colony_positions: [42, 45, 51, 52, 48, 43]},
    {type: "desert",  number: 0,    colony_positions: [44, 47, 53, 54, 51, 45]}
];

class Tile {
    constructor (_tile) {
        this.type = _tile.type;
        this.number = _tile.number;
        this.colony_positions = _tile.colony_positions;
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
        for(let i = 0; i < 72; i++) {
            this.roads.push({owner: 0, color: ""}); 
        }
        
        /**
         * TODO: can make this more efficient by keeping a dictionary of active colonies
         *      and updating it every time a player places a colony.
         */
        // initialize colonies
        this.colonies = [];
        this.init_colonies();

        // variable to check if board has been generated (shuffled) yet
        this.is_shuffled = false;
    }

    // initialize colonies with resource and number mapping
    init_colonies() {
        // create an array of colonies with boardering tiles
        this.colonies = []
        for(let i = 0; i < 54; i++) {
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
        this.init_colonies();
        this.is_shuffled = true;
    }
}

// on object to run the game state machine and keep track of all game objects
class GameManager {
    constructor() {
        this.board = new Board();
        this.players = {}
        this.game_states = {
            "setup": {next_state: "placement"},
            "placement": {next_state: "game"},
            "game": {next_state: "end_game"},
            "end_game": {next_state: "setup"}
        }
        this.turn = {} /* populated in new_player() */
        this.state="setup";

        // dice roll result
        this.dice = 0;

        // add to these lists whenever we get a new player
        this.placement_turns = [];
        this.game_turns = [];
        
        // use this variable to keep track of whose turn it is
        this.turn = 1;

        // use this variable to reverse turn order in placement state
        this.placement_turn_flag = false;

        // use this variable to disable resoure charging in placement state
        this.charge_resources = false;

        // define minimum and maximum number of players
        this.min_players = 2;
        this.max_players = 4;
    }

    // function to update the sequence of turns for game and placement states
    update_turn_sequence() {
        let game_turn_checkpoints = {has_rolled_dice: false};
        this.game_turns.push(game_turn_checkpoints);
        let placement_turn_checkpoints = {has_placed_colony: false, has_placed_road: false};
        this.placement_turns.push(placement_turn_checkpoints);
    }

    // called to allow the placement turn sequence to move in reverse
    refresh_turn_sequence() {
        for (let cp of this.placement_turns) {
            cp.has_placed_colony = false;
            cp.has_placed_road = false;
        }
    }


    // next turn
    next_turn(type) {
        switch(type){
            case "placement":
                if(!this.placement_turn_flag) {
                    if(this.turn < Object.keys(this.placement_turns).length) {
                        this.turn++;
                    }
                    else {
                        this.refresh_turn_sequence();
                        this.placement_turn_flag = true;
                    }
                }
                else if (this.turn > 1) {
                    this.turn--;
                }
                break;

            case "game":
                if(this.turn < Object.keys(this.game_turns).length) {
                    this.turn++;
                }
                else {
                    this.turn = 1;
                }
                break;
        }
        
    }

    // state machine
    state_machine(event, ip) {
        console.log("STATE_MACHINE(): state = " + this.state);
        console.log(`STATE_MACHINE(): this.turn = ${this.turn}`);
        console.log(`STATE_MACHINE(): event = ${event}`);
        let permission = false;
        switch(this.state) {
            case "debug":
                this.charge_resources = false;
                permission = true;
                break;
            case "setup":
                switch(event) {
                    case 'shuffle':
                        permission = true;
                        break;
                    case 'start':
                        console.log("STATE_MACHINE(): start game pressed");
                        // if we have between 2-4 players and board has been shuffled
                        if(Object.keys(this.players).length >= this.min_players &&
                            Object.keys(this.players).length <= this.max_players &&
                            this.board.is_shuffled) {
                                // setup --> placement
                                this.state = this.game_states[this.state].next_state;
                                permission = true;
                            }
                        break;
                    case 'new player':
                        permission = true;
                        break;
                }
                break;

            case "placement":
                this.charge_resources = false;
                switch(event) {
                    case 'build road':
                        console.log(`STATE_MACHINE(): requesting to build road`);
                        if(this.players[ip].player_number === this.turn) {
                            console.log(`STATE_MACHINE(): it's player${this.players[ip].player_number}'s turn`);
                            if(!this.placement_turns[this.turn - 1].has_placed_road) {
                                this.placement_turns[this.turn - 1].has_placed_road = true;
                                console.log(`STATE_MACHINE(): this player has not placed a road yet.`);
                                permission = true;
                            }
                        }
                        break;
                    case 'build colony':
                        if(this.players[ip].player_number === this.turn) {
                            console.log(`STATE_MACHINE(): player ${this.players[ip].player_number} build colony status = ${this.placement_turns[this.turn - 1].has_placed_colony}`);
                            if(!this.placement_turns[this.turn - 1].has_placed_colony) {
                                this.placement_turns[this.turn - 1].has_placed_colony = true;
                                permission = true;
                            }
                        }
                        break;
                    case 'finish turn':
                        if(this.players[ip].player_number === this.turn) {
                            // if the player has placed pieces
                            if(this.placement_turns[this.turn - 1].has_placed_colony &&
                                this.placement_turns[this.turn - 1].has_placed_road) {
                                    permission = true;
                                    if(this.turn === 1 && this.placement_turn_flag) {
                                        // placement --> game
                                        this.state = this.game_states[this.state].next_state;
                                    }
                                    this.next_turn("placement");
                                }
                        }
                        break;
                }
                break;

            case "game":
                this.charge_resources = true;
                switch(event) {
                    case 'roll dice':
                        if(this.players[ip].player_number === this.turn) {
                            this.game_turns[this.turn - 1].has_rolled_dice = true;
                            permission = true;
                        }
                        break;
                    case 'build road': // NOTE: both cases have same requirements --> fall-through
                    case 'build colony':
                        if(this.players[ip].player_number === this.turn) {
                            if(this.game_turns[this.turn - 1].has_rolled_dice) {
                                permission = true;
                            }
                        }
                        break;
                    case 'finish turn':
                        if(this.players[ip].player_number === this.turn) {
                            // if the player has placed pieces
                            if(this.placement_turns[this.turn - 1].has_placed_colony &&
                                this.placement_turns[this.turn - 1].has_placed_road) {
                                    permission = true;
                                    this.next_turn("game");
                                }
                        }
                        break;
                    case 'score':
                        if(this.players[ip].score >= 10) {
                            // game --> end_game
                            this.state = this.game_states[this.state].next_state;
                        }
                        break;
                        case 'update client':
                            permission = true;
                            break;
                }
                break;
            
            case "end_game":
                // TODO: make sure this allows you to show "game over" message
                permission = true;
                break;
        }
        return permission;
    }

    // new player
    new_player(name, color, ip) {
        let result = {success: false, msg: ""};
        // if both name and color fields are populated with non-white spaces
        if (/\S/.test(name) && /\S/.test(color)) {
            // if it is a new player 
            if(!(ip in this.players)) {
                // limit number of this.players to 4
                if(Object.keys(this.players).length < 4) {
                    this.players[ip] = new Player(name, color, Object.keys(this.players).length + 1);
                    result.success = true;
                    result.msg = `welcome ${this.players[ip].name}`;
                    this.update_turn_sequence();
                }
            }
            // else update player info
            else {
                this.players[ip].name = name;
                this.players[ip].color = color;
                result.success = true;
                result.msg = `welcome back ${this.players[ip].name}`;
            }
        }
        else {
            result.success = false;
            result.msg = "You must enter a valid player name and color.";
        }
        return result;
    }

    // check if player exists
    validate_player(ip) {
        return (typeof this.players[ip] === "undefined")
    }

    // check if this player has resources to build this item
    has_resources(ip, structure) {
        if(!this.charge_resources) {
            return true;
        }
        switch(structure) {
            case "road":
                return (this.players[ip].hand["wood"] > 0 && 
                        this.players[ip].hand["brick"] > 0);
            case "colony":
                return (this.players[ip].hand["wood"] > 0 && 
                        this.players[ip].hand["brick"] > 0 &&
                        this.players[ip].hand["sheep"] > 0 &&
                        this.players[ip].hand["wheat"] > 0);
        }
    }

    // use resources to build this item
    use_resources(ip, structure) {
        switch(structure) {
            case "road":
                // do not charge resources if we are in placement state
                if(this.charge_resources){
                    this.players[ip].hand["wood"]--; 
                    this.players[ip].hand["brick"]--;
                }
                this.players[ip].roads--;
                break;
            case "colony":
                // do not charge resources if we are in placement state
                if(this.charge_resources){
                    this.players[ip].hand["wood"]--; 
                    this.players[ip].hand["brick"]--;
                    this.players[ip].hand["sheep"]--;
                    this.players[ip].hand["wheat"]--;
                }
                this.players[ip].colonies--;
                break;
        }
    }

    // place new road based on position and user ip
    place_road(position, ip) {
        let new_road = {data: undefined, msg: ""};
        if(this.players[ip].roads === 0) {
            new_road.msg = "You are out of roads.";
        } 
        else if (this.board.roads[position - 1].owner !== 0) {
            new_road.msg = "A road has already been built here.";
        }
        else if (!this.has_resources(ip, "road")) {
            new_road.msg = "You do not have the resources to build a road";
        }
        else {
            this.board.roads[position - 1].owner = this.players[ip].player_number;
            this.board.roads[position - 1].color = this.players[ip].color;
            new_road.data = {position: position, color: this.board.roads[position - 1].color};
            new_road.msg = `Road built! You have ${this.players[ip].roads} roads left.`;
            this.use_resources(ip, "road");
        }
        return new_road;
    }

    // place new colony based on position and user ip
    place_colony(position, ip) {
        let new_colony = {data: undefined, msg: ""};
        if(this.players[ip].colonies === 0) {
            new_colony.msg = "You are out of colonies.";
        } 
        else if (this.board.colonies[position - 1].owner !== 0) {
            new_colony.msg = "A colony has already been built here.";
        }
        else if (!this.has_resources(ip, "colony")) {
            new_colony.msg = "You do not have the resources to build a colony.";
        }
        else {
            this.board.colonies[position - 1].owner = this.players[ip].player_number;
            this.board.colonies[position - 1].color = this.players[ip].color;
            new_colony.data = {position: position, color: this.board.colonies[position - 1].color};
            new_colony.msg = `Colony built! You have ${this.players[ip].colonies} colonies left. Your score is now ${this.players[ip].score}!`;
            this.use_resources(ip, "colony");
            this.players[ip].update_score();
            // check to see if anyone's score is >= 10, ip will not be checked in this case
            this.state_machine('score', ip);
        }
        return new_colony;
    }

    // roll dice
    roll_dice() {
        let min = 2;
        let max = 12;
        this.dice = Math.floor(Math.random() * (max - min + 1)) + min; ;
    }

    // allocate resources
    // TODO: make this better!
    allocate_resources() {
        // loop through all colonies
        for(let i = 0; i < this.board.colonies.length; i++) {
            // if this colony has been placed
            if(this.board.colonies[i].owner !== 0) {
                // if this colony is bordering a tile with this dice roll
                let roll = this.dice.toString();
                if(Object.keys(this.board.colonies[i].tiles).includes(roll)) {
                    for(let p in this.players) {
                        if(this.players.hasOwnProperty(p)) {
                            // if the player number matches the colony owner
                            if(this.players[p].player_number === this.board.colonies[i].owner) {
                                // loop through tiles with number "roll" and give owner the resources
                                for(let r in this.board.colonies[i].tiles[roll]) {
                                    if(this.board.colonies[i].tiles[roll].hasOwnProperty(r)) {
                                        this.players[p].hand[this.board.colonies[i].tiles[roll][r]]++;
                                    }
                                }
                            }
                            this.players[p].update_num_cards();
                        }
                    }
                }
            }
        }
    }
}

exports.get_game_manager = function() {
    return new GameManager();
}