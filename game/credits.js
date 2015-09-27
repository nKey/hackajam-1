function Credits(){
}

Credits.prototype.preload = function() {
    game.load.image('credits', 'game/assets/credits.png');
    game.load.image('back_button', 'game/assets/button_back.png');
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;    
    this.scale.pageAlignHorizontally = true;
    this.scale.updateLayout();
}

Credits.prototype.create = function () {
    game.add.sprite(0, 0, 'credits');
    this.add.button(46, game.height - 95, 'back_button', this.back, this);
}

Credits.prototype.back = function () {
    this.state.start('Menu');
}