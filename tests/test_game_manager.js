const assert = require('chai').assert;
const game = require("../backend/game_manager.js");

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