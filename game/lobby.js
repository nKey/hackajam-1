function Lobby(){
}

Lobby.prototype.preload = function() {
    game.load.image('menu', 'game/assets/lobby_background.png');
    game.load.image('back_button', 'game/assets/button_back.png');
    game.load.image('ready_button', 'game/assets/button_ready.png')
    game.load.bitmapFont('desyrel', 'game/assets/fonts/desyrel.png', 'game/assets/fonts/desyrel.xml');
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.updateLayout();
}

Lobby.prototype.create = function () {
    game.add.sprite(0, 0, 'menu');

    bmpText = game.add.bitmapText(200, 100, 'desyrel', network_player.name, 64);
    
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