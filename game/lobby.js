function Lobby(){
}

Lobby.prototype.preload = function() {
    game.load.image('menu', 'game/assets/lobby_background.png');
    game.load.image('button', 'game/assets/tank_button.png');
    game.load.bitmapFont('desyrel', 'game/assets/fonts/desyrel.png', 'game/assets/fonts/desyrel.xml');
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.updateLayout();
}

Lobby.prototype.create = function () {
    game.add.sprite(0, 0, 'menu');

    bmpText = game.add.bitmapText(200, 100, 'desyrel', network_player.name, 64);
    
    var buttonCache = game.cache.getImage('button');
    var button = this.add.button(game.world.centerX + 45 - (buttonCache.width/2), 
                                     game.world.height - 150, 'button',  this.gameStart, this);
}

Lobby.prototype.gameStart = function () {
    this.state.start('Game', game);
}