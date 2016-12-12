var Network = {
    //actions received
    sessionPlayersUpdated: function(players) {},
    turretMoved: function (angle) {},
    turretFired: function() {},
    tankMoved: function(movement, rotation) {}
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
    game.session.state.turret_angle = angle;
    firebase.database().ref('games/' + game.session.code + "/state/turret_angle").set(angle);
};

FirebaseNetwork.prototype.action_fire = function() {
    firebase.database().ref('games/' + game.session.code + "/state/last_shot").set(new Date().toISOString());
};

FirebaseNetwork.prototype.control_lever_left = function(value) {
    game.session.state.movement.lever[0] = value;
    this.calculateMovementUpdate();
    firebase.database().ref('games/' + game.session.code + "/state/movement").set(game.session.state.movement);
};

FirebaseNetwork.prototype.control_lever_right = function(value) {
    game.session.state.movement.lever[1] = value
    this.calculateMovementUpdate();
    firebase.database().ref('games/' + game.session.code + "/state/movement").set(game.session.state.movement);
};

FirebaseNetwork.prototype.dead_reckoning = function(x, y, angle) {
    // console.log("//TODO dead_reckoning x: "+x+", y: "+y+", angle: "+angle);
    // game.session.state = value;
    // game.session.save(function() {
    //
    // });
};

FirebaseNetwork.prototype.calculateMovementUpdate = function() {
    var movement = game.session.state.movement;
    var left = movement.lever[0];
    var right = movement.lever[1];
    movement.velocity = (left / 2.0) + (right / 2.0);
    movement.rotation = (right / 2.0) - (left / 2.0);
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
            movement:{
                lever: [0, 0]
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
    firebase.database().ref('games/' + this.code + '/state/turret_angle').on('value', function (turretAngle) {
        Network.turretMoved(turretAngle.val());
    });
    firebase.database().ref('games/' + this.code + '/state/last_shot').on('value', function (lastShot) {
        //last_shot changed, this indicates a new shot
        Network.turretFired(lastShot.val());
    });
    firebase.database().ref('games/' + this.code + '/state/movement').on('value', function (movementObj) {
        var movement = movementObj.val();
        if (movement && movement.velocity && movement.rotation)  {
            Network.tankMoved(movement.velocity, movement.rotation);
        }
    });
};
