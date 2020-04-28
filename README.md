# new-world
EE599 Final Project - a full stack implementation of a board game

## TODO:
1. add hand and structure data to front end (done)
2. grab data from player in update player menu callback (done)
3. put all flexboxes inside div that scales width to height !!!!! (done)
4. update score (done)
5. move as much functionality as possible from server callbacks to GameManager (done)
6. build game state machine (done)
    - only build if you have resources (done)
7. clean up front end (move shuffle and start game buttons to somewhere nice, make title field and message field official)
8. make game rules available 
9. update scoreboard according to state machine on new client or page refresh !!!!
10. make all client functions async !!!!!!!!
11. UNIT TESTS !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
12. CHANGE EXCEPTION HANDLING SYNTAX TO TRY/CATCH
13. update num cards on scoreboard
14. send proper messages based on state, turn, etc.
15. show turn on scoreboard
16. turn transition in placement phase should not require "finish turn"

## Compilation Instructions
```bash
npm install expresss
npm install socket.io

node server.js
```

## Play Game
Enter "localhost:5000" into your browser.

## State Machine
0. DEBUG MODE: do not enter state machine
1. Setup
CAN: Enter name and color
CANNOT: interact with board
- disable callbacks for build road, build colony, roll dice, finish turn, shuffle board (send message to client)
NEXT STATE: start game has been pressed AND 2 - 4 players have joined 
2. Placement (cycle from player 1 to player n and back again)
Player i CAN: 
    place 1 colony and 1 road
    NEXT TURN: player i presses "Finish Turn"
NEXT STATE: player 1 presses "Finish Turn" a 2nd time
3. Game (cycle from player 1 to player n)
Player i CAN:
    1. Roll Dice
    CAN: press "roll dice"
    2. Develop
    CAN: press "build road" or "build colony"
    NEXT TURN: player i presses "Finish turn"
NEXT STATE: any player score >= 10
4. Finish Game

