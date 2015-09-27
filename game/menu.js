function Menu(){

}

 Menu.prototype.preload = function() {
    game.load.image('menu', 'game/assets/menu_background.png');
    game.load.image('button', 'game/assets/tank_button.png');
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
            menu_name = 'Start';
            function_call = this.startGame;
        } else if (i == 1) {
            menu_name = 'Credits';
            function_call = this.credits;
        } else if (i == 2) {
            menu_name = 'Quit';
            function_call = this.quit;
        }
                 var buttonCache = game.cache.getImage('button');
        var button = this.add.button(game.world.centerX + 45 - (buttonCache.width/2), 
                                     game.world.centerY - 40 + (i * 110), 'button', function_call, this);
         
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

