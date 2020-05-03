# new-world
EE599 Final Project - a full stack implementation of a popular board game

## Introduction
This application is a light-weight implementation of the popular board game "Settlers of Catan." It makes use of NodeJS express to run the backend and SocketIO as the communication framework. The front end serves purely as a viewport and input source for each client. All functionality is reserved for the backend save for some simple input handling. When a client connection is made, the server consults an internal game state machine and connection counter to regulate the admission of the client into the game. If they are admitted, all following actions are again filtered and regulated based on the internal game state machine and connection statistics. A visual description of the process can be found at the end of this readme.

## Compilation Instructions
```bash
git clone https://github.com/smcd253/new-world.git
cd new-world/
npm install expresss
npm install socket.io

node server.js
```

## Play Game
Enter "localhost:5000" into your browser.

### Testing
```bash
npm install mocha
sudo apt-get install mocha # for linux users

cd tests
mocha mocha_test_server.js
```

## Client-Server Game Model
[*Figure 1*](info/diagram1.png) <br>
[*Figure 2*](info/diagram2.png) <br>
[*Figure 3*](info/diagram3.png) <br>
[*Figure 4*](info/diagram4.png) <br>
[*Figure 5*](info/diagram5.png) <br>
[*Figure 6*](info/diagram6.png) <br>