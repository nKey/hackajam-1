var Network = {
    //actions received
    sessionPlayersUpdated: function(players) {},
    turretMoved: function (angle) {},
    turretFired: function() {},
    tankControlsChanged: function(movement, rotation) {},
    tankPositionChanged: function(x, y, angle) {}
};


function FirebaseNetwork() {
}

FirebaseNetwork.prototype.init = function() {
    var config = {
      apiKey: "AIzaSyBFYKexzC9Yo0HeRikkJ0CtMl4nIRMZD-o",
      authDomain: "ainotatanks.firebaseapp.com",
      databaseURL: "https://ainotatanks.firebaseio.com",
      storageBucket: "ainotatanks.appspot.com",
      messagingSenderId: "700583824087"
    };
    firebase.initializeApp(config);
    console.log("FirebaseNetwork initialized!");
};

var tryAgainMax = 3;
var remainingRetries = tryAgainMax;
var isLoading = false;
FirebaseNetwork.prototype.createNewGame = function (player, callback) {
    if (isLoading) {
        return;
    }
    isLoading = true;
    var self = this;
    game.session = new GameSession();
    game.session.players = [player];
    firebase.database().ref('games/' + game.session.code).once('value', function(snapshot) {
        if (snapshot.val() !== null) {
            if (remainingRetries > 0) {
                console.log("a game with that code already exists. try again");
                //a game with that code already exists. try again
                self.createNewGame(player, callback);
                remainingRetries--;
            } else {
                game.session = null;
                remainingRetries = tryAgainMax;
                isLoading = false;
                callback("Unable to create new game. Try again later");
            }
        } else {
            firebase.database().ref('games/' + game.session.code).set(game.session)
            .then(function () {
                player.number = 1;
                game.session.registerSessionPlayerUpdatesListener();
                console.log("created new GameSession: "+JSON.stringify(game.session));
                isLoading = false;
                callback();
            });
        }
    });
};

FirebaseNetwork.prototype.joinGame = function (gameCode, player, callback) {
    firebase.database().ref('games/' + gameCode).once('value', function(snapshot) {
        if (snapshot.val() !== null) {
            game.session = gameSessionFromData(snapshot.val());
            if (game.session.players.length >= 2) {
                game.session = null;
                callback("Maximum number of users (2) is reached in this session. Create a new game.");
            } else {
                game.session.players.push(player);
                player.number = game.session.players.length;
                firebase.database().ref('games/' + game.session.code).set(game.session)
                .then(function () {
                    game.session.registerSessionPlayerUpdatesListener();
                    callback();
                });
            }
        } else {
            callback("Couldn't find GameSession '" + gameCode + "'");
        }
    });
};

FirebaseNetwork.prototype.move_turret = function(angle) {
    game.session.state.controls.turret_angle = angle;
    firebase.database().ref('games/' + game.session.code + "/state/controls/turret_angle").set(angle);
};

FirebaseNetwork.prototype.action_fire = function() {
    game.session.state.controls.last_shot = new Date().toISOString();
    this.updateStateControls();
};

FirebaseNetwork.prototype.control_lever_left = function(value) {
    game.session.state.controls.lever[0] = value;
    this.updateStateControls();
};

FirebaseNetwork.prototype.control_lever_right = function(value) {
    game.session.state.controls.lever[1] = value
    this.updateStateControls();
};

FirebaseNetwork.prototype.updateStateControls = function() {
    this.calculateStateUpdate();
    firebase.database().ref('games/' + game.session.code + "/state/controls").set(game.session.state.controls);
}

FirebaseNetwork.prototype.dead_reckoning = function(x, y, angle) {
    game.session.state.movement.x = x;
    game.session.state.movement.y = y;
    game.session.state.movement.angle = angle;
    this.calculateStateUpdate();
    firebase.database().ref('games/' + game.session.code + "/state/movement").set(game.session.state.movement);
};

FirebaseNetwork.prototype.calculateStateUpdate = function() {
    var controls = game.session.state.controls;
    var left = controls.lever[0];
    var right = controls.lever[1];
    game.session.state.controls.velocity = (left / 2.0) + (right / 2.0);
    game.session.state.controls.rotation = (right / 2.0) - (left / 2.0);
}

function gameSessionFromData(data) {
    var session = new GameSession();
    session.code = data["code"];
    session.players = data["players"];
    session.dateCreated = data["dateCreated"];
    if (data["state"] != undefined) {
        session.state = data["state"];
    }
    return session;
}

function GameSession() {
    if (!this.code) {
        this.code = this.generateGameCode();
    }
    if (!this.players) {
        this.players = [];
    }
    if (!this.dateCreated) {
        this.dateCreated = new Date().toISOString();
    }
    if (!this.state) {
        this.state = {
            controls: {
                lever:[0, 0]
                // turret_angle: 0,
                // last_shot: 0,
                // rotation: 0,
                // velocity: 0,
            },
            movement: {
                // x: 0,
                // y: 0,
                // angle: 0
            }
        };
    }
}

GameSession.prototype.generateGameCode = function() {
    var number = parseInt(Math.random() * 99999);
    var str = "" + number;
    var pad = "00000";
    return pad.substring(0, pad.length - str.length) + str;
};

GameSession.prototype.registerSessionPlayerUpdatesListener = function () {
    firebase.database().ref('games/' + this.code + '/players').on('value', function (playersObj) {
        Network.sessionPlayersUpdated(playersObj.val());
    });
    firebase.database().ref('games/' + this.code + '/state/controls/last_shot').on('value', function (lastShotObj) {
        //last_shot changed, this indicates a new shot
        Network.turretFired(lastShotObj.val());
    });
    firebase.database().ref('games/' + this.code + '/state/controls').on('value', function (controlsObj) {
        var controls =controlsObj.val();
        game.session.state.controls = controls
        Network.tankControlsChanged(controls.velocity, controls.rotation);
        Network.turretMoved(controls.turret_angle);
    });
    firebase.database().ref('games/' + this.code + '/state/movement').on('value', function (movementObj) {
        var movement = movementObj.val();
        if (movement != undefined) {
            game.session.state.movement = movement;
            Network.tankPositionChanged(movement.x, movement.y, movement.angle);
        }
    });
};
