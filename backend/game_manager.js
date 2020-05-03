// dependencies 
const game_objects = require("./game_objects.js");

// on object to run the game state machine and keep track of all game objects
class GameManager {
    /**
     * GameManager constructor.
     */
    constructor() {
        this.board = new game_objects.get_new_board();
        this.players = {}
        this.game_states = {
            "setup": {next_state: "placement"},
            "placement": {next_state: "game"},
            "game": {next_state: "end_game"},
            "end_game": {next_state: "setup"}
        }
        this.turn = {} /* populated in new_player() */
        this.state="setup";
        
        // dice roll variables
        this.dice = 0; // result of dice roll
        this.dice_flag = true; // prevent player from rolling dice more than once

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

        // define winning score
        this.winning_score = 3;

        // instruction set for different states
        this.setup_instructions = [
            "Welcome to New World!",
            "Please wait for at least 2 players to join the game.",
            "Please shuffle the board around to a layout that works for you.",
            "Once at least 2 players have joined and 'Shuffle Board' has been pressed you can press 'Start Game'!"
        ];
        this.placement_instructions = [
            "The game has begun!",
            "Each player must place 2 colonies and 2 roads in the following order: Player 1 --> Player n, Player n --> Player 1",
            "We can move to the next part of the game when Player 1 has placed their 2nd colony and road."
        ];
        this.game_instructions = [
            "Now the REAL game begins!",
            "Each player must roll the dice at the beginning of their turn.",
            "Once you have rolled the dice, you can place colonies and roads if you have enough resources.",
            "Press 'Finish Turn' when you are done.",
            "The turn order will be as follows: Player 1 --> Player n, Player 1 --> Player n, etc...",
            `The game will finish when a player reaches ${this.winning_score} or more points.`
        ];
        this.end_game_instructions = [
            "The game has finished!"
        ];
        this.player_instructions = {
            "setup": this.setup_instructions,
            "placement": this.placement_instructions,
            "game": this.game_instructions,
            "end_game": this.game_instructions
        }
    }

    /**
     * update the sequence of turns for game and placement states
     */
    update_turn_sequence() {
        let game_turn_checkpoints = {has_rolled_dice: false};
        this.game_turns.push(game_turn_checkpoints);
        let placement_turn_checkpoints = {has_placed_colony: false, has_placed_road: false};
        this.placement_turns.push(placement_turn_checkpoints);
    }

    /**
     * allow the placement turn sequence to move in reverse
     */
    refresh_turn_sequence() {
        for (let cp of this.placement_turns) {
            cp.has_placed_colony = false;
            cp.has_placed_road = false;
        }
    }

    /**
     * iterate the turn number based on turn type
     * @param {string} type 
     */
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


    /**
     * The main game state machine.
     * This function takes client action and ip
     * to determine if the action is permissable based on the state.
     * Moves to the next state if the conditions permit.
     * @param {string} event 
     * @param {string} ip 
     */
    state_machine(event, ip) {
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
                        if(this.players[ip].player_number === this.turn) {
                            if(!this.placement_turns[this.turn - 1].has_placed_road) {
                                permission = true;
                            }
                        }
                        break;
                    case 'place road':
                        if(this.players[ip].player_number === this.turn) {
                            if(!this.placement_turns[this.turn - 1].has_placed_road) {
                                this.placement_turns[this.turn - 1].has_placed_road = true;
                                permission = true;
                            }
                        }
                        break;
                    case 'build colony':
                        if(this.players[ip].player_number === this.turn) {
                            if(!this.placement_turns[this.turn - 1].has_placed_colony) {
                                permission = true;
                            }
                        }
                        break;
                    case 'place colony':
                        if(this.players[ip].player_number === this.turn) {
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
                    case 'build road': // NOTE: all cases have same requirements --> fall-through
                    case 'place road':
                    case 'build colony':
                    case 'place colony':
                        if(this.players[ip].player_number === this.turn) {
                            if(this.game_turns[this.turn - 1].has_rolled_dice) {
                                permission = true;
                            }
                        }
                        break;
                    case 'finish turn':
                        if(this.players[ip].player_number === this.turn) {
                            // if the player has placed pieces
                            if(this.game_turns[this.turn - 1].has_rolled_dice) {
                                    permission = true;
                                    this.next_turn("game");
                                }
                        }
                        break;
                    case 'score':
                        if(this.players[ip].score >= this.winning_score) {
                            // game --> end_game
                            this.state = this.game_states[this.state].next_state;
                            console.log("STATE_MACHINE(): *************** time to end game! ***************");
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
    /**
     * Creates a new player or updates an existing player if the conditions permit. 
     * Returns a result object indicating if player creation or update was successful.
     * @param {string} name 
     * @param {string} color 
     * @param {string} ip 
     */
    new_player(name, color, ip) {
        let result = {success: false, msg: "", bcast: ""};
        // if both name and color fields are populated with non-white spaces
        if (/\S/.test(name) && /\S/.test(color) && /\S/.test(ip)) {
            // if it is a new player 
            if(!(ip in this.players)) {
                // limit number of this.players to 4
                if(Object.keys(this.players).length < 4) {
                    this.players[ip] = new game_objects.get_new_player(name, color, Object.keys(this.players).length + 1);
                    result.success = true;
                    result.msg = `welcome ${this.players[ip].name}`;
                    result.bcast = `${this.players[ip].name} has joined the game.`;
                    this.update_turn_sequence();
                }
                else {
                    result.msg = "Cannot create player. There are already 4 players in this game."
                }
            }
            // else update player info
            else {
                this.players[ip].name = name;
                this.players[ip].color = color;
                result.success = true;
                result.msg = `welcome back ${this.players[ip].name}`;
                result.bcast = `${this.players[ip].name} has rejoined the game.`;
            }
        }
        else {
            result.success = false;
            result.msg = "You must enter a valid player name and color.";
        }
        return result;
    }

    /**
     * Check if player from this ip is registered.
     * @param {string} ip 
     */
    validate_player(ip) {
        return (typeof this.players[ip] === "undefined")
    }

    /**
     * check if this player has resources to build this item
     * @param {string} ip 
     * @param {string} structure 
     */
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

    /**
     * Subtract resources from player hand depending on the structure type.
     * @param {string} ip 
     * @param {string} structure 
     */
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

    /**
     * Place new road based on position and user ip
     * @param {Number} position 
     * @param {string} ip 
     */
    place_road(position, ip) {
        let new_road = {data: undefined, msg: ""};
        if(this.players[ip].roads === 0) {
            new_road.msg = "You are out of roads.";
        } 
        else if (position < 1 || position > this.board.num_roads) {
            new_road.msg = "Position out of range.";
        }
        else if (this.board.roads[position - 1].owner !== 0) {
            new_road.msg = "A road has already been built here.";
        }
        else if (!this.has_resources(ip, "road")) {
            new_road.msg = "You do not have the resources to build a road.";
        }
        else {
            this.board.roads[position - 1].owner = this.players[ip].player_number;
            this.board.roads[position - 1].color = this.players[ip].color;
            new_road.data = {position: position, color: this.board.roads[position - 1].color};
            this.use_resources(ip, "road");
            new_road.msg = `Road built! You have ${this.players[ip].roads} roads left.`;
        }
        return new_road;
    }

    /**
     * Place new colony based on position and user ip
     * @param {Number} position 
     * @param {string} ip 
     */
    place_colony(position, ip) {
        let new_colony = {data: undefined, msg: ""};
        if(this.players[ip].colonies === 0) {
            new_colony.msg = "You are out of colonies.";
        }
        else if (position < 1 || position > this.board.num_colonies) {
            new_colony.msg = "Position out of range.";
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
            this.use_resources(ip, "colony");
            this.players[ip].update_score();
            new_colony.msg = `Colony built! You have ${this.players[ip].colonies} colonies left. Your score is now ${this.players[ip].score}!`;
            // check to see if anyone's score is >= 10, ip will not be checked in this case
            this.state_machine('score', ip);
        }
        return new_colony;
    }

    /**
     * Roll dice.
     */
    roll_dice() {
        let min = 2;
        let max = 12;
        this.dice = Math.floor(Math.random() * (max - min + 1)) + min; ;
    }

    /**
     * Allocate resources to each user boarding a tile with a number 
     * matching the result of this dice roll.
     * TODO: reduce complexity with active colonies dictionary.
     */
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

/**
 * Returns an instance of GameManager.
 */
exports.get_new_game_manager = function() {
    return new GameManager();
}