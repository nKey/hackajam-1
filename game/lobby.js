function Lobby(){
}

Lobby.prototype.preload = function() {
    game.load.bitmapFont('roboto', 'game/assets/carrier_command.png', 'game/assets/carrier_command.xml');

    game.load.image('menu', 'game/assets/lobby_background.png');
    game.load.image('back_button', 'game/assets/button_back.png');
    game.load.image('ready_button', 'game/assets/button_ready.png');
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.updateLayout();
}

Lobby.prototype.create = function () {
    game.add.sprite(0, 0, 'menu');

    if (network_player.number == 1) {
        showPlayer1(network_player.name);
    } else {
        showPlayer2(network_player.name);
    }
    this.add.button(22, game.height - 92, 'back_button', this.back, this);
    this.add.button(game.width - 480, game.height - 92, 'ready_button', this.gameStart, this);
}

function showPlayer1 (name) {
    var bmpText = game.add.bitmapText(0, 200, 'roboto', name, 20);
    bmpText.x = 234 - (bmpText.width/2);
}

function showPlayer2 (name) {
    var bmpText = game.add.bitmapText(0, 200, 'roboto', name, 20);
    bmpText.x = 654 - (bmpText.width/2);
}

Lobby.prototype.gameStart = function () {
    game.sound.stopAll();
    this.state.start('Game', game);
}

Lobby.prototype.back = function () {
    this.state.start('Nickname');
}

network_callbacks.game_room_update_join = function(player_id, player_name) {
    var otherPlayerNumber = network_player.number === 1 ? 2 : 1;
    if (otherPlayerNumber === 1) {
        showPlayer1(player_name);
    } else {
        showPlayer2(player_name);
    }
    if (player_id != network_player.id) {
        setupPlayer1(network_player.id, player_id);
    }
};

function setupPlayer1(myID, otherPlayerID) {
    if (myID.localeCompare(otherPlayerID)) {
        network_player.number = 1;
    } else {
        network_player.number = 2;
    }
}
