function Lobby() {
}

var lobby_players;

Lobby.prototype.init = function(players) {
    lobby_players = players;
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

    populateUI();

    this.add.button(22, game.height - 92, 'back_button', this.back, this);
    this.add.button(game.width - 480, game.height - 92, 'ready_button', this.gameStart, this);
}

function populateUI() {
    showPlayer1("");
    showPlayer2("");
    var i = 1;
    $.each(lobby_players, function(player_id, player) {
        if (i == 1) {
            showPlayer1(player.name);
            console.log("showPlayer1 "+player.name);
        } else if (i == 2) {
            showPlayer2(player.name);
            console.log("showPlayer2 "+player.name);
        } else {
            console.log("Error: should not have more than 2 players: " + JSON.stringify(lobby_players));
        }
        i++;
    });
}

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
}

Lobby.prototype.back = function () {
    this.state.start('Nickname');
}

network_callbacks.game_room_update_join = function(player_id, player_name) {
    network_player = new NetworkPlayer(player_id, player_name);

    if (player_id != network_player.id) {
        setupPlayer1(network_player.id, player_id);
    }

    var otherPlayerNumber = this_player.number === 1 ? 2 : 1;
    if (otherPlayerNumber === 1) {
        showPlayer1(player_name);
    } else {
        showPlayer2(player_name);
    }
};

network_callbacks.game_room_update_leave = function(player_id_leave) {
    $.each(lobby_players, function(player_id, player) {
        if (player_id === player_id_leave) {
            delete lobby_players[player_id_leave];
        }
    });
    network_player.name = "";
    populateUI();
};

function setupPlayer1(myID, otherPlayerID) {
    if (myID.localeCompare(otherPlayerID)) {
        network_player.number = 1;
    } else {
        network_player.number = 2;
    }
}
