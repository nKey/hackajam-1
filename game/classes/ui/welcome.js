function Welcome(){

}

 Welcome.prototype.preload = function() {
	// Load all the needed resources for the menu.
	game.load.image('welcome', 'game/assets/welcome_splash.png');
    game.load.audio('menuMusic', ['game/assets/sound/menu_music.mp3']);
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;    
    this.scale.pageAlignHorizontally = true;
    this.scale.updateLayout();
};

Welcome.prototype.create = function () {
	this.add.button(0, 0, 'welcome', this.startNickName, this);
    this.musicPlayer = game.add.audio('menuMusic', 0.2, false);
    this.musicPlayer.play('', 0, 0.2, false);
};

Welcome.prototype.startNickName = function () {
	this.state.start('Nickname');
};

