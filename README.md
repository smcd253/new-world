# new-world
EE599 Final Project - a full stack implementation of a board game

## TODO:
1. add hand and structure data to front end (done)
2. grab data from player in update player menu callback (done)
4. update score
5. move as much functionality as possible from server callbacks to GameManager
6. build game state machine
    - only build if you have resources
7. clean up front end (move shuffle and start game buttons to somewhere nice, make title field and message field official)
8. make game rules available 

## Compilation Instructions
```bash
npm install expresss
npm install socket.io

node server.js
```

## Play Game
Enter "localhost:5000" into your browser.