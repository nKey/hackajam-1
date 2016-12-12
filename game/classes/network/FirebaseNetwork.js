var Network = {
    //actions received
    sessionPlayersUpdated: function(players) {},
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
            console.log("Found GameSession 1: \n"+JSON.stringify(snapshot.val()));
            game.session = gameSessionFromData(snapshot.val());
            // game.session.players = snapshot.child("players").val();
            console.log("Found GameSession 2: \n"+JSON.stringify(game.session));
            if (game.session.players.length >= 2) {
                game.session = null;
                console.log("Maximum number of users (2) is reached in this session. Create a new game.");
                callback("Maximum number of users (2) is reached in this session. Create a new game.");
            } else {
                game.session.players.push(player);
                player.number = game.session.players.length;
                console.log("Found GameSession 3: \n"+JSON.stringify(game.session));
                game.session.save(function () {
                    game.session.registerSessionPlayerUpdatesListener();
                    console.log("joined GameSession 4: \n" + JSON.stringify(game.session));
                    callback();
                });
            }
        } else {
            console.log("Couldn't find GameSession '" + gameCode + "'");
            callback("Couldn't find GameSession '" + gameCode + "'");
        }
    });
};

FirebaseNetwork.prototype.action_fire = function() {
    console.log("//TODO action_fire");
};

FirebaseNetwork.prototype.control_lever_left = function(value) {
    console.log("//TODO control_lever_left");
};

FirebaseNetwork.prototype.control_lever_right = function(value) {
    console.log("//TODO control_lever_right");
};

FirebaseNetwork.prototype.dead_reckoning = function(x, y, angle) {
    console.log("//TODO dead_reckoning");
};

function gameSessionFromData(data) {
    var session = new GameSession();
    session.code = data["code"];
    session.players = data["players"];
    session.dateCreated = data["dateCreated"];
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
};
