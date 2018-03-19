var express = require('express'),
    http = require('http');
var app = express();
var server = http.createServer(app); 
var socket = require('socket.io').listen(server);
var highScores = [0, 0, 0, 0, 0];
var highNames = [".", ".", ".", ".", "."];
var cometsBeforeStart = [];
var connClients = 0;
var connNicknames = [];
var connIDs = [];
server.listen(3000, '0.0.0.0', function(){
  console.log('listening on *:3000');
});

app.use(express.static(__dirname + '/public'));

socket.sockets.on('connection', newConnection);
socket.on('connect', function() { 
    connClients++;
});

function newConnection(socket) {
    console.log("New client connected with ID: " + socket.id);
    var connID = socket.id;
    socket.emit('connID', connID);
    socket.on('clearComets', clearUserComets);
    socket.on('clearInfo', clearUserInfo);
    sendCometInfo();
    if(connNicknames[0]) {
        socket.emit('nickname', {connNicknames, connIDs});
        socket.broadcast.emit('nickname', {connNicknames, connIDs});
    }

    socket.on('ship', shipPosition);
    socket.on('score', finalScores);
    socket.on('comet', cometPosition);
    socket.on('nickname', nicknameToLobby);
    socket.on('ready', stateOfPlayers);
    
    function shipPosition(coords) {
        socket.broadcast.emit('ship', coords);
    }
    
    function finalScores(userScore) {
        if(highScores.length < 5) {
            if(userScore[1] != 0) {
                highScores.push(userScore[1]);
                highNames.push(userScore[0]);
                sortArray(highScores, highNames);
            }
        } else {
            sortArray(highScores, highNames);
            if(userScore[1] >= highScores[4]) {
                highScores[4] = userScore[1];
                highNames[4] = userScore[0];
            }
            sortArray(highScores, highNames);
        }
        socket.emit('score', {highScores, highNames});
        socket.broadcast.emit('score', {highScores, highNames});
        console.log("Highscores: " + highScores);
        console.log("Highnames: " + highNames);
    }
    
    function cometPosition(cometInfo) {
        console.log("Sent from: " + cometInfo.id);
        console.log("Sending comet: " + cometInfo);
        socket.broadcast.emit('comet', cometInfo);
        cometsBeforeStart.push(cometInfo);
    }
    
    function clearUserComets(userID) {
        for(i = 0;i < cometsBeforeStart.length;i++) {
            for(j = 0;j < connIDs.length;j++) {
                if(cometsBeforeStart[i]) {
                    if(cometsBeforeStart[i].id == connIDs[j]) {
                        console.log("User left, deleting his comets: " + cometsBeforeStart[i]);
                        cometsBeforeStart.splice(i, 1);
                    }
                    break;
                }
            }
        }
    }
    
    function clearUserInfo(userInfo) {
        for(i = 0;i < connIDs.length;i++) {
            if(connIDs[i] == userInfo.userID) {
                console.log("Deleting names, ids!");
                connIDs.splice(i, 1);
                connNicknames.splice(i, 1);
            }
        }
    }
    
    function sendCometInfo() {
        if(cometsBeforeStart) {
            for(i = 0;i < cometsBeforeStart.length;i++) {
                for(j = 0;j < connIDs.length;j++) {
                    if(cometsBeforeStart[i]) {
                        if(cometsBeforeStart[i].id == connIDs[j]) {
                            socket.broadcast.emit('comet', cometsBeforeStart[i]);
                            console.log("Comet ID exists: " + cometsBeforeStart[i]);
                        } else {
                            console.log("Comet ID doesn't exist: " + cometsBeforeStart[i]);
                            //cometsBeforeStart.splice(i, 1);
                        }
                    }
                }  
            }
        }
    }
    
    function nicknameToLobby(nickname) {
        if(connNicknames.length < 4) {
            connNicknames.push(nickname);
            connIDs.push(socket.id);    
        }
        socket.emit('nickname', {connNicknames, connIDs});
        socket.broadcast.emit('nickname', {connNicknames, connIDs});
        console.log("Emitted data...");
        console.log("Nicknames: " + connNicknames);
        console.log("IDs: " + connIDs);
    }
    
    function stateOfPlayers(stateReady) {
        if(stateReady[1]) {
            socket.broadcast.emit('state', stateReady);
            console.log("State: " + stateReady);
        } else {
            stateReady[1] = false;
            socket.broadcast.emit('state', stateReady);
            console.log("State: " + stateReady);
        }
    }
    
    function sortArray(a, b) {
        var done;
        do {
            done = false;
            for(var i = 0;i < highScores.length-1;i++) {
                if(a[i] < a[i+1]) {
                    var tempScore = a[i];
                    var tempName = b[i];
                    a[i] = a[i+1];
                    b[i] = b[i+1];
                    a[i+1] = tempScore;
                    b[i+1] = tempName;
                    done = true;
                }
            }
        } while(done);
    }
    
    socket.on('disconnect', function() { 
        connClients--;
        for(i = 0;i < connIDs.length;i++) {
            if(connIDs[i] == socket.id) {
                for(j = 0; j < cometsBeforeStart.length;j++) {
                    if(cometsBeforeStart[i]) {
                        if(cometsBeforeStart[i].id = connIDs[i]) {
                            cometsBeforeStart.splice(i, 1);
                        }    
                    }
                }
                console.log("Comets: " + cometsBeforeStart.length);
                console.log("User " + connNicknames[i] + " left...");
                connIDs.splice(i, 1);
                connNicknames.splice(i, 1);
                socket.emit('nickname', {connNicknames, connIDs});
                socket.broadcast.emit('nickname', {connNicknames, connIDs});
                console.log("Users left: " + connNicknames);
                console.log("User IDs left: " + connIDs);
            }
        }
    });
}