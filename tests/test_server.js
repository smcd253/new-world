// reference: https://github.com/liamks/Testing-Socket.IO
const assert = require('chai').assert;
const io = require('socket.io-client');

let socketURL = 'http://localhost:5000';

let options ={
  transports: ['websocket'],
  'force new connection': true
};

// NOTE: server.js must be running for these tests to work.
describe("When Client Sends 'new client'", function() {
  it('Server should ask me for name and color if not a registered player.', function(done){
    // setup
    let client1 = io.connect(socketURL, options);
    let expected_response = 'Please enter your name and color to join the game.';
    // client prompt
    client1.on('connect', function(){
      client1.emit('new client');
    });
    
    // process server response
    client1.on('server message', async function(data){
      assert.equal(data, expected_response);
      client1.emit('new game');
      client1.disconnect();
      done();
    });
  });

  it('Server should welcome me back if I am a registered player.', function(done){
    // setup
    let name = "mocha";
    let color = "brown";
    let client1 = io.connect(socketURL, options);
    let expected_responses = [
      'Please enter your name and color to join the game.',
      `welcome ${name}`,
      `welcome back ${name}`
    ];
    
    // client prompt
    client1.on('connect', function(){
      client1.emit('new client');
    });

    // process server responses in sequence
    let i = 0;
    client1.on('server message', async function(data){
      switch (i) {
        case 0:
          assert.equal(data, expected_responses[i]);
          client1.emit('new player', name, color);
          break;
        case 1:
          assert.equal(data, expected_responses[i]);
          client1.emit('new client');
          break;
        default:
          assert.equal(data, expected_responses[i]);
          client1.emit('new game');
          client1.disconnect();
          done();
          break;  
      }
      i++;
    });
  });
});
