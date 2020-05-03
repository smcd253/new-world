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