function Lobby(){
}

Lobby.prototype.preload = function() {
        game.load.image('menu', 'game/assets/lobby_background.png');
        game.load.image('button', 'game/assets/tank_button.png');
}

Lobby.prototype.create = function () {
    game.add.sprite(0, 0, 'menu');
    
    var buttonCache = game.cache.getImage('button');
    var button = this.add.button(game.world.centerX + 45 - (buttonCache.width/2), 
                                     game.world.height - 150, 'button',  this.gameStart, this);
}

 Lobby.prototype.gameStart = function () {
        this.state.start('Game', game);

  }