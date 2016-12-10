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
};

 Menu.prototype.create = function () {
     game.add.sprite(0, 0, 'menu');
     
     for (var i = 0; i < 3; i++) {
        var buttonCache;
        if (i == 0) {
            buttonCache = game.cache.getImage('button_play');
            var button = this.add.button(game.world.centerX - (buttonCache.width/2), game.world.centerY - 40 + (i * 110), 'button_play', this.newGame, this);
            var text = game.add.text(0, 0, "NEW GAME", {font: "16px Arial", fill: "#ffffff"});
            button.addChild(text);
        } else if (i == 1) {
            buttonCache = game.cache.getImage('button_play');
            var button = this.add.button(game.world.centerX - (buttonCache.width/2), game.world.centerY - 40 + (i * 110), 'button_play', this.joinGame, this);
            var text = game.add.text(0, 0, "JOIN GAME", {font: "16px Arial", fill: "#ffffff"});
            button.addChild(text);
        } else if (i == 2) {
            buttonCache = game.cache.getImage('button_credits');
            this.add.button(game.world.centerX - (buttonCache.width/2),
                                     game.world.centerY - 40 + (i * 110), 'button_credits', this.credits, this);
        }
    }
 };

Menu.prototype.newGame = function () {
    var self = this;
    game.network.createNewGame(game.thisPlayer, function () {
        if (game.session !== null) {
            console.log("NewGame created with success! begin lobby");
            self.state.start('Lobby');
        } else {
            alert("Unable to create new game. Try again later");
        }
    });
};

Menu.prototype.joinGame = function () {
    var self = this;
    var gameSessionCode = "00001";
    game.network.joinGame(gameSessionCode, game.thisPlayer, function () {
        if (game.session !== null) {
            console.log("NewGame created with success! begin lobby");
            self.state.start('Lobby');
        } else {
            alert("There is no session '" + gameSessionCode + "'. Create a new game or try again.");
        }
    });
};

Menu.prototype.credits = function () {
    this.state.start('Credits');
};

Menu.prototype.quit = function () {
    this.state.start('Welcome');
};

