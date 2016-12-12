var Network = {
    //actions received
    sessionPlayersUpdated: function(players) {},
    turretFired: function()  {}
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
            game.session.save(function () {
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
                game.session.save(function () {
                    game.session.registerSessionPlayerUpdatesListener();
                    callback();
                });
            }
        } else {
            callback("Couldn't find GameSession '" + gameCode + "'");
        }
    });
};

FirebaseNetwork.prototype.action_fire = function() {
    game.session.state.last_shot = new Date().toISOString();
    game.session.save();
};

FirebaseNetwork.prototype.control_lever_left = function(value) {
    console.log("WILL SAVE control_lever_left "+value);
    game.session.state.movement_components[0] = value;
    game.session.save(function() {
        console.log("SAVED control_lever_left "+value);
    });
};

FirebaseNetwork.prototype.control_lever_right = function(value) {
    console.log("//TODO control_lever_right");
    console.log("WILL SAVE control_lever_right "+value);
    game.session.state.movement_components[1] = value;
    game.session.save(function() {
        console.log("SAVED control_lever_right "+value);
    });
};

FirebaseNetwork.prototype.dead_reckoning = function(x, y, angle) {
    // console.log("//TODO dead_reckoning x: "+x+", y: "+y+", angle: "+angle);
    // game.session.state = value;
    // game.session.save(function() {
    //
    // });
};

function gameSessionFromData(data) {
    var session = new GameSession();
    session.code = data["code"];
    session.players = data["players"];
    session.dateCreated = data["dateCreated"];
    session.state = data["state"];
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
            movement_components: [0, 0],
            last_shot: null
        };
    }
}

GameSession.prototype.generateGameCode = function() {
    var number = parseInt(Math.random() * 99999);
    var str = "" + number;
    var pad = "00000";
    return pad.substring(0, pad.length - str.length) + str;
};

GameSession.prototype.save = function (callback) {
    firebase.database().ref('games/' + this.code).set(this).then(callback);
};

GameSession.prototype.registerSessionPlayerUpdatesListener = function () {
    firebase.database().ref('games/' + this.code + '/players').on('value', function (playersObj) {
        Network.sessionPlayersUpdated(playersObj.val());
    });
    firebase.database().ref('games/' + this.code + '/state/last_shot').on('value', function (lastShot) {
        //last_shot changed, this indicates a new shot
        Network.turretFired(lastShot.val());
    });
};
