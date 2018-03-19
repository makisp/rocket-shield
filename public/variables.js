var started;
var font;
var socket;
var spaceship, friendlyShip;
var mouseVector;
var earth;
var comets = [], friendlyComets = [];
var lasers = [], friendlyLasers;
var coords = {}
var cometInfo = {}
var names = [], nickname, userID;
var scores = [], userScore, scoreHTML = [], score = 0;
var buttonHighscores;
var menuLost, endMenu;
var clientNum1, clientNum2, clientNum3, clientNum4;
var clientID1 = null, clientID2 = null, clientID3 = null, clientID4 = null;
var buttonReady1, buttonReady2, buttonReady3, buttonReady4;
var allReady = false, firstCometsDone = false;
var cometInfoBeforeStart = [];
var x = 0;