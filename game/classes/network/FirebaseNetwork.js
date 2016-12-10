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
FirebaseNetwork.prototype.createNewGame = function (player, callback) {
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
                callback("Unable to create new game. Try again later");
            }
        } else {
            game.session.save(function () {
                console.log("created new GameSession: "+JSON.stringify(game.session));
                callback();
            });
        }
    });
};

FirebaseNetwork.prototype.joinGame = function (gameCode, player, callback) {
    firebase.database().ref('games/' + gameCode).once('value', function(snapshot) {
        game.session = new GameSession(snapshot.val());
        game.session.players = snapshot.child("players").val();
        if (game.session !== null) {
            console.log("Found GameSession: \n"+JSON.stringify(game.session));
            if (game.session.players.length >= 2) {
                game.session = null;
                callback("Maximum number of users (2) is reached in this session. Create a new game.");
            } else {
                game.session.players.push(player);
                game.session.save(function () {
                    console.log("joined GameSession: \n" + JSON.stringify(game.session));
                    callback();
                });
            }
        } else {
            callback("Couldn't find GameSession "+gameCode);
        }
    });
};

function GameSession(data) {
    GameSession.extend(this, data);
}

function GameSession() {
    this.code = this.generateGameCode();
    this.players = [];
    this.dateCreated = new Date().toISOString();
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