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

    var bmpText = game.add.bitmapText(0, 200, 'roboto', network_player.name, 20);
    bmpText.x = 234 - (bmpText.width/2);

    var bmpText = game.add.bitmapText(0, 200, 'roboto', network_player.name, 20);
    bmpText.x = 654 - (bmpText.width/2);
    
    this.add.button(22, game.height - 92, 'back_button', this.back, this);
    this.add.button(game.width - 480, game.height - 92, 'ready_button', this.gameStart, this);
}

Lobby.prototype.gameStart = function () {
    game.sound.stopAll();
    this.state.start('Game', game);
}

Lobby.prototype.back = function () {
    this.state.start('Nickname');
}