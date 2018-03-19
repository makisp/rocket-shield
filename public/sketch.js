//Game settings
var startingComets = 1;
var firstWavePercentage = 90;
var secondWavePercentage = 70;
var thirdWavePercentage = 40;
var fourthWavePercentage = 20;

function preload() {
    socket = io.connect('192.168.100.128:3000');
    font = loadFont('resources/roboto.ttf');
}

function setup() {
    c = createCanvas(windowWidth, windowHeight);
    c.parent('canvas-container');
    textFont(font);
    earth = loadImage("resources/img-earth.png");
    
    socket.on('score', receivedScores);
    socket.on('ship', receivedCoords);
    socket.on('comet', receivedCometInfo);
    socket.on('nickname', receivedNicknames);
    socket.on('state', receivedState);
    
    spaceship = new Spaceship();
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
    fill(0);
}

function draw() {
    background(0);
    image(earth, 0, 0, earth.width, windowHeight);
    if(!allReady) {
        checkButtonStatus();
    }
    if(started) {
        if(cometInfoBeforeStart.length > 0 && !firstCometsDone) {
            socket.emit('clearInfo', {nickname, userID});
            for(i = 0;i < cometInfoBeforeStart.length;i++) {
                comets.push(new Comet(false, false, cometInfoBeforeStart[i].cometPosX, cometInfoBeforeStart[i].cometPosY, cometInfoBeforeStart[i].cometR, cometInfoBeforeStart[i].cometVelocity, cometInfoBeforeStart[i].cometSides, cometInfoBeforeStart[i].cometOffset));
            }
            firstCometsDone = true;
        }
        for(var i = lasers.length-1;i >= 0;i--) {
            lasers[i].render();
            lasers[i].update();
            for(var j = comets.length-1;j >= 0;j--) {
                if (lasers[i].hit(comets[j])) {
                    if(comets[j].r < 26) {
                         if(comets.length >= 20) {
                            if(fourthWavePercentage > random(1, 101)) {
                                comets.push(new Comet());
                            }
                        } else if(comets.length >= 10) {
                            if(thirdWavePercentage > random(1, 101)) {
                                comets.push(new Comet());
                            }
                        } else if(comets.length >= 5) {
                            if(secondWavePercentage > random(1, 101)) {
                                comets.push(new Comet());
                            }
                        } else {
                            if(firstWavePercentage > random(1, 101)) {
                                comets.push(new Comet());
                            }
                        }
                        score += 2;
                    } else {
                        var newComets = comets[j].divide();
                        comets = comets.concat(newComets);
                    }
                    comets.splice(j, 1);
                    lasers.splice(i, 1);
                    i--;
                    j--;
                    break;
                }
            }
            
            if(lasers[i]) {
                if(lasers[i].energy()) {
                    lasers.splice(i, 1);
                }
            }
        }
        spaceship.render();
        spaceship.turn();
        spaceship.update();
        spaceship.edges();
        if(friendlyShip) {
            friendlyShip.render();
        }
        if(friendlyLasers) {
            friendlyLasers.render();
        }
        for(var i = 0;i < comets.length;i++) {
            comets[i].render();
            comets[i].update();
            if(comets[i].burnout()) {
                comets[i].colorRed += 0.4;
                comets[i].colorGreen -= 0.4;
                comets[i].colorBlue -= 0.4;
            } else {
                while(comets[i].colorRed > 99 && comets[i].colorGreen <99 && comets[i].colorBlue <99) {
                    comets[i].colorRed -= 0.4;
                    comets[i].colorGreen += 0.4;
                    comets[i].colorBlue += 0.4;
                }
            }
            if(spaceship.hit(comets[i])) {
                displayMenuLost();
                noLoop();
            }
            if(comets[i].edges()) {
                comets.splice(i, 1);
            }
        }
    }
}

function checkButtonStatus() {
    if(buttonReady4.style.display == "block") {
        if(buttonReady1.style.backgroundColor == "green" && (buttonReady2.style.backgroundColor == "green" && buttonReady3.style.backgroundColor == "green" && buttonReady4.style.backgroundColor == "green")) {
            started = true;
            menu.style.display = "none";
            allReady = true;
        }
    } else if(buttonReady3.style.display == "block") {
        if(buttonReady1.style.backgroundColor == "green" && (buttonReady2.style.backgroundColor == "green" && buttonReady3.style.backgroundColor == "green")) {
            started = true;
            menu.style.display = "none";
            allReady = true;
        }
    } else if(buttonReady2.style.display == "block") {
        if(buttonReady1.style.backgroundColor == "green" && (buttonReady2.style.backgroundColor == "green")) {
            started = true;
            menu.style.display = "none";
            allReady = true;
        }
    }
}

function displayScore() {
    textSize(32);
    text(nickname, 30, 40);
    text("Score: " + score, windowWidth - 180, 40);
}

function displayMenuLost() {
    socket.emit('clearComets', userID);
    saveScore();
    menuLost.style.display = "block";
}

function saveScore() {
    userScore = [nickname, score];
    socket.emit('score', userScore);
}

function keyPressed() {
    if(keyCode == 87) {
        spaceship.boosting(true);
        coords = {
            shipBoost: true
        }
        socket.emit('ship', coords);
    }
}

function keyReleased() {
    spaceship.boosting(false);
}

function mousePressed() {
    lasers.push(new Laser(spaceship.pos, spaceship.heading));
    coords = {
        shipX: spaceship.pos.x,
        shipY: spaceship.pos.y,
        shipH: spaceship.heading,
        laser: true
    }
    socket.emit('ship', coords);
}

window.onload = function(){
    socket.on('connID', function(connID) {
        userID = connID;
        console.log("Connection ID: " + userID);    
    });
    var buttonJoin = document.getElementById("button-join");
    var inputName = document.getElementById("input-name");
    var menu = document.getElementById("menu");
    var buttonAgain = document.getElementById("button-again");
    endMenu = document.getElementById("end-menu");
    scoreHTML[0] = document.getElementById("score-1");
    scoreHTML[1] = document.getElementById("score-2");
    scoreHTML[2] = document.getElementById("score-3");
    scoreHTML[3] = document.getElementById("score-4");
    scoreHTML[4] = document.getElementById("score-5");
    buttonHighscores = document.getElementById("button-end");
    menuLost = document.getElementById("end-text");
    clientNum1 = document.getElementById("client-num-1");
    clientNum2 = document.getElementById("client-num-2");
    clientNum3 = document.getElementById("client-num-3");
    clientNum4 = document.getElementById("client-num-4");
    buttonReady1 = document.getElementById("button-ready-1");
    buttonReady2 = document.getElementById("button-ready-2");
    buttonReady3 = document.getElementById("button-ready-3");
    buttonReady4 = document.getElementById("button-ready-4");
    var color1 = "red", color2 = "red", color3 = "red", color4 = "red";
    
    buttonReady1.addEventListener('click', function() {
        if(color1 == "red") {
            if(nickname == clientNum1.innerHTML.substring(3)) {
                buttonReady1.style.backgroundColor = "green";
                var stateReady = [nickname, true];
                socket.emit('ready', stateReady);
                color1 = "green";
            }
        } else {
            buttonReady1.style.backgroundColor = "red";
            color1 = "red";
            var stateReady = [nickname, false];
            socket.emit('ready', stateReady);
       }
    });
    buttonReady2.addEventListener('click', function() {
       if(color2 == "red") {
           if(nickname == clientNum2.innerHTML.substring(3)) {
                buttonReady2.style.backgroundColor = "green";
                var stateReady = [nickname, true];
               socket.emit('ready', stateReady);
               color2 = "green";
           }
       } else {
            buttonReady2.style.backgroundColor = "red";
            color2 = "red";
            var stateReady = [nickname, false];
            socket.emit('ready', stateReady);
       }
    });
    buttonReady3.addEventListener('click', function() {
       if(color3 == "red") {
           if(nickname == clientNum3.innerHTML.substring(3)) {
                buttonReady3.style.backgroundColor = "green";
                var stateReady = [nickname, true];
                socket.emit('ready', stateReady);
                color3 = "green";
           }
       } else {
            buttonReady3.style.backgroundColor = "red";
            color3 = "red";
            var stateReady = [nickname, false];
            socket.emit('ready', stateReady);
       }
    });
    buttonReady4.addEventListener('click', function() {
       if(color4 == "red") {
           if(nickname == clientNum4.innerHTML.substring(3)) {
                buttonReady4.style.background = "green";
                var stateReady = [nickname, true];
                socket.emit('ready', stateReady);
               color4 = "green";
           }
       } else {
            buttonReady4.style.backgroundColor = "red";
            color4 = "red";
            var stateReady = [nickname, false];
            socket.emit('ready', stateReady);
       }
    });
    
    buttonJoin.addEventListener('click', function() {
        if(inputName.value == '') {
            inputName.style.borderColor = "red";
        } else {
            for(i = 0;i < cometInfoBeforeStart.length;i++) {
                cometInfoBeforeStart[i] = [];
            }
            nickname = inputName.value;
            socket.emit('nickname', nickname);
            inputName.style.color = "white";
            inputName.style.backgroundColor = "rgba(0, 0, 0, 0.8)"
            inputName.style.pointerEvents = "none";
            buttonJoin.style.backgroundColor = "rgba(0, 0, 0, 0.8)"
            buttonJoin.style.pointerEvents = "none";
            buttonJoin.innerHTML = "";
            for(var i = 0;i < startingComets;i++) {
                comets.push(new Comet());    
            }
        }
    });
    
    buttonHighscores.addEventListener('click', function() {
        menuLost.style.display = "none";
        displayHighscores();
        endMenu.style.display = "block";
    });
    
    buttonAgain.addEventListener('click', function() {
       location.reload(); 
    });
}

window.oncontextmenu = function ()
{
    return false;
}

function receivedScores(finalScores) {
    for(i = 0;i < 5;i++) {
        names[i] = finalScores.highNames[i];
        scores[i] = score1 = finalScores.highScores[i];
    }
}

function displayHighscores() {
    for(i = 0;i < 5;i++) {
        scoreHTML[i].innerHTML = names[i] + "............" + scores[i];
    }
}

function receivedCoords(coords) {
    //// friendly boost doesn't show
    /*if(coords.shipBoost) {
        friendlyShip.boost();
    }*/
    friendlyShip = new Spaceship(coords.shipX, coords.shipY, coords.shipH);
    var friendPos = createVector(coords.shipX, coords.shipY);
    if(coords.laser) {
        lasers.push(new Laser(friendPos, coords.shipH, true));
    }
}

function receivedCometInfo(cometInfo) {
    if(!started) {
        if(cometInfo.id) {
            console.log("User: " + userID + " Comet: " + cometInfo.id);
            if(userID !== cometInfo.id) {
                cometInfoBeforeStart[x] = cometInfo;
                console.log(cometInfoBeforeStart[x]);
                x++;
            }
        }
        
    } else {
        comets.push(new Comet(false, false, cometInfo.cometPosX, cometInfo.cometPosY, cometInfo.cometR, cometInfo.cometVelocity, cometInfo.cometSides, cometInfo.cometOffset));
    }
}

function receivedNicknames(player) {
    if(!player.connNicknames[0]) {
        clientNum1.innerHTML = "1. ";
        clientID1 = null;
        buttonReady1.style.display = "none";
        clientNum2.innerHTML = "2. ";
        clientID2 = null;
        buttonReady2.style.display = "none";
        clientNum3.innerHTML = "3. ";
        clientID3 = null;
        buttonReady3.style.display = "none";
        clientNum4.innerHTML = "4. ";
        clientID4 = null;
        buttonReady4.style.display = "none";
    }else if(!player.connNicknames[1]) {
        clientNum1.innerHTML = "1. " + player.connNicknames[0];
        clientID1 = player.connIDs[0];
        buttonReady1.style.display = "block";
        clientNum2.innerHTML = "2. ";
        clientID2 = null;
        buttonReady2.style.display = "none";
        clientNum3.innerHTML = "3. ";
        clientID3 = null;
        buttonReady3.style.display = "none";
        clientNum4.innerHTML = "4. ";
        clientID4 = null;
        buttonReady4.style.display = "none";
    } else if(!player.connNicknames[2]) {
        clientNum1.innerHTML = "1. " + player.connNicknames[0];
        clientID1 = player.connIDs[0];
        buttonReady1.style.display = "block";
        clientNum2.innerHTML = "2. " + player.connNicknames[1];
        clientID2 = player.connIDs[1];
        buttonReady2.style.display = "block";
        clientNum3.innerHTML = "3. ";
        clientID3 = null;
        buttonReady3.style.display = "none";
        clientNum4.innerHTML = "4. ";
        clientID4 = null;
        buttonReady4.style.display = "none";     
    } else if(!player.connIDs[3]) {
        clientNum1.innerHTML = "1. " + player.connNicknames[0];
        clientID1 = player.connIDs[0];
        buttonReady1.style.display = "block";
        clientNum2.innerHTML = "2. " + player.connNicknames[1];
        clientID2 = player.connIDs[1];
        buttonReady2.style.display = "block";
        clientNum3.innerHTML = "3. " + player.connNicknames[2];
        clientID3 = player.connIDs[2];
        buttonReady3.style.display = "block";
        clientNum4.innerHTML = "4. ";
        clientID4 = null;
        buttonReady4.style.display = "none";
    } else {
        clientNum1.innerHTML = "1. " + player.connNicknames[0];
        clientID1 = player.connIDs[0];
        buttonReady1.style.display = "block";
        clientNum2.innerHTML = "2. " + player.connNicknames[1];
        clientID2 = player.connIDs[1];
        buttonReady2.style.display = "block";
        clientNum3.innerHTML = "3. " + player.connNicknames[2];
        clientID3 = player.connIDs[2];
        buttonReady3.style.display = "block";
        clientNum4.innerHTML = "4. " + player.connNicknames[3];
        clientID4 = player.connIDs[3];
        buttonReady4.style.display = "block";
    }
}

function receivedState(state) {
    if(state[1]) {
        if(clientNum1.innerHTML.substring(3) == state[0]){
            buttonReady1.style.backgroundColor = "green";
        } else if(clientNum2.innerHTML.substring(3) == state[0]) {
            buttonReady2.style.backgroundColor = "green";
        } else if(clientNum3.innerHTML.substring(3) == state[0]) {
            buttonReady3.style.backgroundColor = "green";
        } else if(clientNum4.innerHTML.substring(3) == state[0]) {
            buttonReady4.style.backgroundColor = "green";
        }
    } else {
        if(clientNum1.innerHTML.substring(3) == state[0]){
            buttonReady1.style.backgroundColor = "red";
        } else if(clientNum2.innerHTML.substring(3) == state[0]) {
            buttonReady2.style.backgroundColor = "red";
        } else if(clientNum3.innerHTML.substring(3) == state[0]) {
            buttonReady3.style.backgroundColor = "red";
        } else if(clientNum4.innerHTML.substring(3) == state[0]) {
            buttonReady4.style.backgroundColor = "red";
        }
    }
}