function Menu(){

}

 Menu.prototype.preload = function() {
    game.load.image('menu', 'game/assets/menu_background.png');
    game.load.image('button_play', 'game/assets/tank_play.png');
    game.load.image('button_credits', 'game/assets/tank_credits.png');
    game.load.image('button_quit', 'game/assets/tank_quit.png');
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;    
    this.scale.pageAlignHorizontally = true;
    this.scale.updateLayout();
}

 Menu.prototype.create = function () {
     game.add.sprite(0, 0, 'menu');
     
     for (var i = 0; i < 3; i++) 
     {
        var menu_name;
        var function_call;
        if (i == 0) {
            var buttonCache = game.cache.getImage('button_play');
            var button = this.add.button(game.world.centerX - (buttonCache.width/2), 
                                     game.world.centerY - 40 + (i * 110), 'button_play', this.startGame, this);
        } else if (i == 1) {
            var buttonCache = game.cache.getImage('button_credits');
            var button = this.add.button(game.world.centerX - (buttonCache.width/2), 
                                     game.world.centerY - 40 + (i * 110), 'button_credits', this.credits, this);
        } else if (i == 2) {
            var buttonCache = game.cache.getImage('button_quit');
            var button = this.add.button(game.world.centerX - (buttonCache.width/2), 
                                     game.world.centerY - 40 + (i * 110), 'button_quit', this.quit, this);
        }
 
    }
 }

 Menu.prototype.startGame = function () {
    this.state.start('Nickname');
  }

   Menu.prototype.credits = function () {
     this.state.start('Credits');
  }
 
  Menu.prototype.quit = function () {
     this.state.start('Welcome');
  }

