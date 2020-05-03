const assert = require('chai').assert;
const game = require("../backend/game_manager.js");

describe("game_manager.state_machine(event, ip)", function() {
    // state = debug
    it("Should return true when event = 'any' and state = 'debug'.", function() {
        let game_manager = game.get_new_game_manager();
        game_manager.state = "debug";
        let result = game_manager.state_machine("any", "0.0.0.0");
        assert.equal(result, true);
    });

    // state = setup
    it("Should return true when event = 'shuffle' and state = 'setup'.", function() {
        let game_manager = game.get_new_game_manager();
        game_manager.state = "setup";
        let result = game_manager.state_machine("shuffle", "0.0.0.0");
        assert.equal(result, true);
    });

    it("Should return true when event = 'new player' and state = 'setup'.", function() {
        let game_manager = game.get_new_game_manager();
        game_manager.state = "setup";
        let result = game_manager.state_machine("new player", "0.0.0.0");
        assert.equal(result, true);
    });

    it("Should return true when event = 'start', state = 'setup', the board has been shuffled, \
        and there are enough players registered.", function() {
        let game_manager = game.get_new_game_manager();
        game_manager.state = "setup";
        game_manager.board.shuffle_board();
        let name = "mocha", color = "brown", ip = "0.0.0.";
        for(let i = 0; i < 4; i++) {
            game_manager.new_player(name + i, color, ip + i);
        }
        let result = game_manager.state_machine("start", "0.0.0.0");
        assert.equal(result, true);
    });

    it("Should iterate to the next state when event = 'start', state = 'setup', the board has been shuffled, \
        and there are enough players registered.", function() {
        let game_manager = game.get_new_game_manager();
        game_manager.state = "setup";
        game_manager.board.shuffle_board();
        let name = "mocha", color = "brown", ip = "0.0.0.";
        for(let i = 0; i < 4; i++) {
            game_manager.new_player(name + i, color, ip + i);
        }
        game_manager.state_machine("start", "0.0.0.0");
        assert.equal(game_manager.state, "placement");
    });

    // state = placement
    it("Should not charge resources when state = 'placement'.", function() {
        let game_manager = game.get_new_game_manager();
        game_manager.state = "placement";
        assert.equal(game_manager.charge_resources, false);
    });

    // state = game
    it("Should not charge resources when state = 'placement'.", function() {
        let game_manager = game.get_new_game_manager();
        game_manager.state = "game";
        assert.equal(game_manager.charge_resources, false);
    });
});

describe("game_manager.new_player(name, color, ip)", function() {
    it("Should create a new player if proper inputs and few enough existing players.", function() {
        let game_manager = game.get_new_game_manager();
        let name = "mocha", color = "brown", ip = "0.0.0.0";
        let result = game_manager.new_player(name, color, ip);
        assert.equal(result.success, true);
        assert.equal(result.msg, `welcome ${name}`);
        assert.equal(result.bcast, `${name} has joined the game.`);
    });

    it("Should update this player if proper inputs and few enough existing players.", function() {
        let game_manager = game.get_new_game_manager();
        let name = "mocha", color = "brown", ip = "0.0.0.0";
        let result = game_manager.new_player(name, color, ip);
        name = "chai", color = "white";
        result = game_manager.new_player(name, color, ip);
        assert.equal(result.success, true);
        assert.equal(result.msg, `welcome back ${name}`);
        assert.equal(result.bcast, `${name} has rejoined the game.`);
    });

    it("Should reject if there are already 4 players", function() {
        let game_manager = game.get_new_game_manager();
        let name = "mocha", color = "brown", ip = "0.0.0.";
        for(let i = 0; i < 4; i++) {
            game_manager.new_player(name + i, color, ip + i);
        }
        let result = game_manager.new_player(name + 4, color, ip);
        assert.equal(result.success, false);
        assert.equal(result.msg, "Cannot create player. There are already 4 players in this game.");
        assert.equal(result.bcast, "");
    });

    it("Should reject if an input is empty.", function() {
        let game_manager = game.get_new_game_manager();
        let name = "", color = "brown", ip = "0.0.0.0";
        let result = game_manager.new_player(name, color, ip);
        assert.equal(result.success, false);
        assert.equal(result.msg, "You must enter a valid player name and color.");
        assert.equal(result.bcast, "");
    });

    it("Should reject if an input is only white spaces.", function() {
        let game_manager = game.get_new_game_manager();
        let name = "mocha", color = "   ", ip = "0.0.0.0";
        let result = game_manager.new_player(name, color, ip);
        assert.equal(result.success, false);
        assert.equal(result.msg, "You must enter a valid player name and color.");
        assert.equal(result.bcast, "");
    });
});

describe("game_manager.validate_player(ip)", function() {
    it("Should return false if player is defined.", function() {
        let game_manager = game.get_new_game_manager();
        let name = "mocha", color = "brown", ip = "0.0.0.0";
        game_manager.new_player(name, color, ip);
        let result = game_manager.validate_player(ip);
        assert.equal(result, false);
    });

    it("Should return true if player is not defined.", function() {
        let game_manager = game.get_new_game_manager();
        let ip = "0.0.0.0";
        let result = game_manager.validate_player(ip);
        assert.equal(result, true);
    });
});

describe("game_manager.has_resources(ip, structure)", function() {
    it("Should return true if this player has enough resources to build a road.", function() {
        let game_manager = game.get_new_game_manager();
        game_manager.charge_resources = true;
        let name = "mocha", color = "brown", ip = "0.0.0.0";
        game_manager.new_player(name, color, ip);
        game_manager.players[ip].hand['wood'] = 1;
        game_manager.players[ip].hand['brick'] = 1;
        let result = game_manager.has_resources(ip, "road");
        assert.equal(result, true);
    });

    it("Should return false if this player DOES NOT have enough resources to build a road.", function() {
        let game_manager = game.get_new_game_manager();
        game_manager.charge_resources = true;
        let name = "mocha", color = "brown", ip = "0.0.0.0";
        game_manager.new_player(name, color, ip);
        let result = game_manager.has_resources(ip, "road");
        assert.equal(result, false);
    });

    it("Should return true if this player has enough resources to build a colony.", function() {
        let game_manager = game.get_new_game_manager();
        game_manager.charge_resources = true;
        let name = "mocha", color = "brown", ip = "0.0.0.0";
        game_manager.new_player(name, color, ip);
        game_manager.players[ip].hand['wood'] = 1;
        game_manager.players[ip].hand['brick'] = 1;
        game_manager.players[ip].hand['wheat'] = 1;
        game_manager.players[ip].hand['sheep'] = 1;
        let result = game_manager.has_resources(ip, "colony");
        assert.equal(result, true);
    });
    
    it("Should return false if this player DOES NOT have enough resources to build a road.", function() {
        let game_manager = game.get_new_game_manager();
        game_manager.charge_resources = true;
        let name = "mocha", color = "brown", ip = "0.0.0.0";
        game_manager.new_player(name, color, ip);
        let result = game_manager.has_resources(ip, "colony");
        assert.equal(result, false);
    });

    it("Should return true if this player DOES NOT have enough resources to build a road but charge_resources is false.", function() {
        let game_manager = game.get_new_game_manager();
        let name = "mocha", color = "brown", ip = "0.0.0.0";
        game_manager.new_player(name, color, ip);
        let result = game_manager.has_resources(ip, "colony");
        assert.equal(result, true);
    });
});

describe("game_manager.use_resources(ip, structure)", function() {
    it("Should subtract 1 brick and 1 wood from the player's hand if we call this function on 'road.'", function() {
        let game_manager = game.get_new_game_manager();
        game_manager.charge_resources = true;
        let name = "mocha", color = "brown", ip = "0.0.0.0";
        game_manager.new_player(name, color, ip);
        game_manager.players[ip].hand['wood'] = 1;
        game_manager.players[ip].hand['brick'] = 1;
        game_manager.use_resources(ip, "road");
        assert.equal(game_manager.players[ip].hand['wood'], 0);
        assert.equal(game_manager.players[ip].hand['brick'], 0);
    });

    it("Should subtract 1 brick, wood, wheat, and sheep from the player's hand if we call this function on 'colony.'", function() {
        let game_manager = game.get_new_game_manager();
        game_manager.charge_resources = true;
        let name = "mocha", color = "brown", ip = "0.0.0.0";
        game_manager.new_player(name, color, ip);
        game_manager.players[ip].hand['wood'] = 1;
        game_manager.players[ip].hand['brick'] = 1;
        game_manager.players[ip].hand['wheat'] = 1;
        game_manager.players[ip].hand['sheep'] = 1;
        game_manager.use_resources(ip, "colony");
        assert.equal(game_manager.players[ip].hand['wood'], 0);
        assert.equal(game_manager.players[ip].hand['brick'], 0);
        assert.equal(game_manager.players[ip].hand['wheat'], 0);
        assert.equal(game_manager.players[ip].hand['sheep'], 0);
    });

    it("Should NOT subtract anything if charge_resources is false.", function() {
        let game_manager = game.get_new_game_manager();
        let name = "mocha", color = "brown", ip = "0.0.0.0";
        game_manager.new_player(name, color, ip);
        game_manager.use_resources(ip, "colony");
        assert.equal(game_manager.players[ip].hand['wood'], 0);
        assert.equal(game_manager.players[ip].hand['brick'], 0);
        assert.equal(game_manager.players[ip].hand['wheat'], 0);
        assert.equal(game_manager.players[ip].hand['sheep'], 0);
    });
});

describe("game_manager.place_road(position, ip)", function() {
    it("Should return 'Road built!' if I have the proper amount of resources.", function() {
        let game_manager = game.get_new_game_manager();
        game_manager.charge_resources = true;
        let name = "mocha", color = "brown", ip = "0.0.0.0";
        game_manager.new_player(name, color, ip);
        game_manager.players[ip].hand['wood'] = 1;
        game_manager.players[ip].hand['brick'] = 1;
        let position = 1;
        let expected_num_roads_left = 14;
        let result = game_manager.place_road(position, ip);
        assert.equal(result.msg, `Road built! You have ${expected_num_roads_left} roads left.`);
        assert.equal(result.data.position, position);
        assert.equal(result.data.color, color);
    });

    it("Should return 'Road built!' if game_manager.charge_resources is false.", function() {
        let game_manager = game.get_new_game_manager();
        let name = "mocha", color = "brown", ip = "0.0.0.0";
        game_manager.new_player(name, color, ip);
        let position = 1;
        let expected_num_roads_left = 14;
        let result = game_manager.place_road(position, ip);
        assert.equal(result.msg, `Road built! You have ${expected_num_roads_left} roads left.`);
        assert.equal(result.data.position, position);
        assert.equal(result.data.color, color);
    });


    it("Should return 'You are out of roads.' if the player has no more roads.", function() {
        let game_manager = game.get_new_game_manager();
        game_manager.charge_resources = true;
        let name = "mocha", color = "brown", ip = "0.0.0.0";
        game_manager.new_player(name, color, ip);
        game_manager.players[ip].hand['wood'] = 1;
        game_manager.players[ip].hand['brick'] = 1;
        game_manager.players[ip].roads = 0;
        let position = 1;
        let result = game_manager.place_road(position, ip);
        assert.equal(result.msg, `You are out of roads.`);
    });

    it("Should return 'Position out of range.' if the position is out of range.", function() {
        let game_manager = game.get_new_game_manager();
        game_manager.charge_resources = true;
        let name = "mocha", color = "brown", ip = "0.0.0.0";
        game_manager.new_player(name, color, ip);
        game_manager.players[ip].hand['wood'] = 1;
        game_manager.players[ip].hand['brick'] = 1;
        let position = -1;
        let result = game_manager.place_road(position, ip);
        assert.equal(result.msg, `Position out of range.`);
    });

    it("Should return 'A road has already been built here.' if there is already a road at this position.", function() {
        let game_manager = game.get_new_game_manager();
        game_manager.charge_resources = true;
        let name = "mocha", color = "brown", ip = "0.0.0.0";
        game_manager.new_player(name, color, ip);
        game_manager.players[ip].hand['wood'] = 2;
        game_manager.players[ip].hand['brick'] = 2;
        let position = 1;
        game_manager.place_road(position, ip);
        let result = game_manager.place_road(position, ip);
        assert.equal(result.msg, `A road has already been built here.`);
    });

    it("Should return 'You do not have the resourecs to build a road.' if the player does not have enough resources to build a road.", function() {
        let game_manager = game.get_new_game_manager();
        game_manager.charge_resources = true;
        let name = "mocha", color = "brown", ip = "0.0.0.0";
        game_manager.new_player(name, color, ip);
        let position = 1;
        let result = game_manager.place_road(position, ip);
        assert.equal(result.msg, `You do not have the resources to build a road.`);
    });
});

describe("game_manager.place_colony(position, ip)", function() {
    it("Should return 'Colony built!' if I have the proper amount of resources.", function() {
        let game_manager = game.get_new_game_manager();
        game_manager.charge_resources = true;
        let name = "mocha", color = "brown", ip = "0.0.0.0";
        game_manager.new_player(name, color, ip);
        game_manager.players[ip].hand['wood'] = 1;
        game_manager.players[ip].hand['brick'] = 1;
        game_manager.players[ip].hand['wheat'] = 1;
        game_manager.players[ip].hand['sheep'] = 1;
        let position = 1;
        let expected_num_colonies_left = 4;
        let expected_score = 1;
        let result = game_manager.place_colony(position, ip);
        assert.equal(result.msg, `Colony built! You have ${expected_num_colonies_left} colonies left. Your score is now ${expected_score}!`);
        assert.equal(result.data.position, position);
        assert.equal(result.data.color, color);
    });

    it("Should return 'Colony built!' if game_manager.charge_resources is false.", function() {
        let game_manager = game.get_new_game_manager();
        let name = "mocha", color = "brown", ip = "0.0.0.0";
        game_manager.new_player(name, color, ip);
        let position = 1;
        let expected_num_colonies_left = 4;
        let expected_score = 1;
        let result = game_manager.place_colony(position, ip);
        assert.equal(result.msg, `Colony built! You have ${expected_num_colonies_left} colonies left. Your score is now ${expected_score}!`);
        assert.equal(result.data.position, position);
        assert.equal(result.data.color, color);
    });

    it("Should return 'You are out of colonies.' if the player has no more colonies.", function() {
        let game_manager = game.get_new_game_manager();
        game_manager.charge_resources = true;
        let name = "mocha", color = "brown", ip = "0.0.0.0";
        game_manager.new_player(name, color, ip);
        game_manager.players[ip].hand['wood'] = 1;
        game_manager.players[ip].hand['brick'] = 1;
        game_manager.players[ip].hand['wheat'] = 1;
        game_manager.players[ip].hand['sheep'] = 1;
        game_manager.players[ip].colonies = 0;
        let position = 1;
        let result = game_manager.place_colony(position, ip);
        assert.equal(result.msg, `You are out of colonies.`);
    });

    it("Should return 'Position out of range.' if the position is out of range.", function() {
        let game_manager = game.get_new_game_manager();
        game_manager.charge_resources = true;
        let name = "mocha", color = "brown", ip = "0.0.0.0";
        game_manager.new_player(name, color, ip);
        game_manager.players[ip].hand['wood'] = 1;
        game_manager.players[ip].hand['brick'] = 1;
        game_manager.players[ip].hand['wheat'] = 1;
        game_manager.players[ip].hand['sheep'] = 1;
        let position = -1;
        let result = game_manager.place_colony(position, ip);
        assert.equal(result.msg, `Position out of range.`);
    });

    it("Should return 'A colony has already been built here.' if there is already a colony at this position.", function() {
        let game_manager = game.get_new_game_manager();
        game_manager.charge_resources = true;
        let name = "mocha", color = "brown", ip = "0.0.0.0";
        game_manager.new_player(name, color, ip);
        game_manager.players[ip].hand['wood'] = 2;
        game_manager.players[ip].hand['brick'] = 2;
        game_manager.players[ip].hand['wheat'] = 2;
        game_manager.players[ip].hand['sheep'] = 2;
        let position = 1;
        game_manager.place_colony(position, ip);
        let result = game_manager.place_colony(position, ip);
        assert.equal(result.msg, `A colony has already been built here.`);
    });

    it("Should return 'You do not have the resourecs to build a colony.' if the player does not have enough resources to build a colony.", function() {
        let game_manager = game.get_new_game_manager();
        game_manager.charge_resources = true;
        let name = "mocha", color = "brown", ip = "0.0.0.0";
        game_manager.new_player(name, color, ip);
        let position = 1;
        let result = game_manager.place_colony(position, ip);
        assert.equal(result.msg, `You do not have the resources to build a colony.`);
    });
});

describe("game_manager.roll_dice()", function() {
    it("Should produce a number between 2 and 12.", function() {
        let game_manager = game.get_new_game_manager();
        game_manager.roll_dice();
        assert.isAtLeast(game_manager.dice, 1);
        assert.isAtMost(game_manager.dice, 12);
    });
});

describe("game_manager.allocate_resources()", function() {
    it("Should give me resources if I have colonies all over the board.", function() {
        let game_manager = game.get_new_game_manager();
        game_manager.state = "debug";
        let name = "mocha", color = "brown", ip = "0.0.0.0";
        game_manager.new_player(name, color, ip);
        game_manager.board.shuffle_board();
        game_manager.players[ip].colonies = game_manager.board.num_colonies;
        for (let i = 0; i < game_manager.board.num_colonies; i++) {
            game_manager.place_colony(i + 1, ip);
        }
        game_manager.roll_dice();
        game_manager.allocate_resources();
        assert.isAtLeast(game_manager.players[ip].num_cards, 1);
        // confirm we still have a score of 5 becase we have unloaded all of our colonies
        assert.equal(game_manager.players[ip].score, 5);
    });
});
