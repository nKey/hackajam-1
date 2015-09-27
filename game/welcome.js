function Welcome(){

}

 Welcome.prototype.preload = function() {
        // Load all the needed resources for the menu.
        game.load.image('welcome', 'game/assets/welcome_splash.png');
    }

 Welcome.prototype.create = function () {
        this.add.button(0, 0, 'welcome', this.startMenu, this);
    }

 Welcome.prototype.startMenu = function () {
        this.state.start('Menu');
  }

