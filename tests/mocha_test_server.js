// reference: https://github.com/liamks/Testing-Socket.IO
let assert = require('chai').assert;
let io = require('socket.io-client');

let socketURL = 'http://localhost:5000';

let options ={
  transports: ['websocket'],
  'force new connection': true
};

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

  // it('If I am a new client and the game is already in progress, server should inform me.', function(done){
  //   // setup
  //   let name1 = "mocha1";
  //   let color1 = "brown";
  //   let name2 = "mocha2";
  //   let color2 = "black";
  //   let client1 = io.connect(socketURL, options);
    
  //   let expected_responses1 = [
  //     'Please enter your name and color to join the game.',
  //     `welcome ${name1}`,
  //   ];
  //   let expected_responses2 = [
  //     'Please enter your name and color to join the game.',
  //     `welcome ${name2}`,
  //     "The game has begun!"
  //   ];
  //   let expected_responses3 = [
  //     'Game already in progress. You are welcome to stay as a spectator.'
  //   ];
  //   // client prompt
  //   client1.on('connect', function(){
  //     client1.emit('new client');
  //     let client2 = io.connect(socketURL, options);
  //     client2.on('connect', function(){
  //       client2.emit('new client');
  //     });
  
  //     let client3 = io.connect(socketURL, options);

  //   });
    
  //   // process server responses in sequence
  //   let i = 0;
  //   client1.on('server message', async function(data){
  //     switch (i) {
  //       case 0:
  //         assert.equal(data, expected_responses1[i]);
  //         client1.emit('new player', name1, color1);
  //         break;
  //       case 1:
  //         assert.equal(data, expected_responses1[i]);
  //         client1.emit('shuffle');
  //         client2.emit('new player', name2, color2);
  //         break;
  //     }
  //     i++;
  //   });
    
  //   let j = 0;
  //   client2.on('server message', async function(data){
  //     switch (j) {
  //       case 0:
  //         assert.equal(data, expected_responses2[j]);
  //         break;
  //       case 1:
  //         assert.equal(data, expected_responses2[j]);
  //         client2.emit('start');
  //         break;
  //       case 2:
  //         assert.equal(data, expected_responses2[j]);
  //         client3.emit('new client');
  //         break;
  //     }
  //     j++;
  //   });

  //   client3.on('server message', async function(data) {
  //     assert.equal(data, expected_responses3[0]);
  //     client1.emit('new game');
  //     client1.disconnect();
  //     client2.disconnect();
  //     client3.disconnect();
  //     done();
  //   });
  // });
});
