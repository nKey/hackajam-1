function Lobby() {
}

Lobby.prototype.preload = function() {
    game.load.bitmapFont('roboto', 'game/assets/carrier_command.png', 'game/assets/carrier_command.xml');

    game.load.image('menu', 'game/assets/lobby_background.png');
    game.load.image('back_button', 'game/assets/button_back.png');
    game.load.image('ready_button', 'game/assets/button_ready.png');
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.updateLayout();
};

Lobby.prototype.create = function () {
    game.add.sprite(0, 0, 'menu');

    this.populateUI();

    this.add.button(22, game.height - 92, 'back_button', this.back, this);
    this.add.button(game.width - 480, game.height - 92, 'ready_button', this.gameStart, this);
};

Lobby.prototype.populateUI = function () {
    showPlayer1("");
    showPlayer2("");
    var i = 1;
    $.each(game.session.players, function(player_id, player) {
        if (i == 1) {
            showPlayer1(player.name);
        } else if (i == 2) {
            showPlayer2(player.name);
        } else {
            console.log("Error: should not have more than 2 players: " + JSON.stringify(game.session.players));
        }
        i++;
    });
};

var player1Text;
function showPlayer1 (name) {
    game.world.remove(player1Text);
    player1Text = game.add.bitmapText(0, 200, 'roboto', name, 20);
    player1Text.x = 234 - (player1Text.width/2);
}

var player2Text;
function showPlayer2 (name) {
    game.world.remove(player2Text);
    player2Text = game.add.bitmapText(0, 200, 'roboto', name, 20);
    player2Text.x = 654 - (player2Text.width/2);
}

Lobby.prototype.gameStart = function () {
    game.sound.stopAll();
    this.state.start('Game', game);
};

Lobby.prototype.back = function () {
    this.state.start('Menu');
};

Network.sessionPlayersUpdated = function (players) {
    game.session.players = players;
    if (game.state.current == "Lobby") {
        game.state.callbackContext.populateUI();
    }
};
