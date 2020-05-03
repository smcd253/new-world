// reference: http://liamkaufman.com/blog/2012/01/28/testing-socketio-with-mocha-should-and-socketio-client/
let should = require('should');
let io = require('socket.io-client');

let socketURL = 'http://localhost:5000';

let options ={
  transports: ['websocket'],
  'force new connection': true
};


describe("When Client Sends 'new client'", function() {
  it('Server should ask me for name and color if not a registered player.', function(done){
      let client1 = io.connect(socketURL, options);
    
      client1.on('connect', function(){
        client1.emit('new client');
      });
    
      client1.on('server message', async function(data){
        data.should.equal('Please enter your name and color to join the game.');
        client1.disconnect();
        done();
      });
    });
});

// // registered player --> welcome back
// it('Server should welcome me back if I am a regsitered player.', function(done) {
//   // setup
//   let name = "mocha";
//   let color = "black";
//   socket.emit(client_messages[1], name, color); // register as new player
//   socket.emit(client_messages[0]); // reconnect to see if we are still registered
//   let expected_response = `welcome back ${name}`;

//   // test
//   setTimeout(function() {
//     // Check that server response matches expected response
//     socket.on(function(message) {
//         expect(message).to.equal(expected_response);
//     });
//   }, timeout_immediate);
  
//   // cleanup
//   socket.disconnect();
//   done();
// });

// // unregistered player AND game has already begun --> 'cannot join, but you are welcome to spectate.'
// it('Server should update my player menu if I am a registered player.', function(done) {
//   // setup
//   let name = "mocha";
//   let color = "black";
//   socket.emit(client_messages[1], name, color); // register as new player
//   socket.emit(client_messages[0]); // reconnect to see if we are still registered
//   let my_player_number = 2;
//   let my_player = game_objects.get_new_player(name, color, my_player_number);
//   let expected_response = 'update player menu';

//   // test 
//   setTimeout(function() {
//     // Check that server response matches expected response
//     socket.on(function(message, data) {
//         expect(message).to.equal(expected_response);
//         expect(JSON.stringify(data)).to.equal(JSON.stringify(my_player));
//     });
//   }, timeout_immediate);
  
//   // cleanup
//   socket.disconnect();
//   done();
// });