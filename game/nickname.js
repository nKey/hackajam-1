function Nickname(){
}

var myInput;

Nickname.prototype.preload = function() {
    game.load.image('menu', 'game/assets/menu_background.png');
    game.load.image('button', 'game/assets/tank_button.png');
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;    
    this.scale.pageAlignHorizontally = true;
    this.scale.updateLayout();
}

Nickname.prototype.create = function () {
    game.add.sprite(0, 0, 'menu');
    
    
    this.myInput = this.createInput(this.game.world.centerX + 30, this.game.world.centerY + 100);
    this.myInput.anchor.set(0.5);
    this.myInput.canvasInput.value('');
    
    var buttonCache = game.cache.getImage('button');
    var button = this.add.button(game.world.centerX + 45 - (buttonCache.width/2), 
                                     game.world.height - 200, 'button',  this.lobby, this);


    var buttonCache = game.cache.getImage('button');
    var button = this.add.button(game.world.centerX + 45 - (buttonCache.width/2), 
                                     game.world.height - 120, 'button',  this.quit, this);

     
}

Nickname.prototype.createInput = function(x, y) {
    var bmd = this.add.bitmapData(350, 110);    
    this.myInput = this.game.add.sprite(x, y, bmd);

    this.myInput.canvasInput = new CanvasInput({
        canvas: bmd.canvas,
        fontSize: 30,
        fontFamily: 'Arial',
        fontColor: '#212121',
        fontWeight: 'bold',
        width: 400,
        padding: 8,
        borderWidth: 1,
        borderColor: '#000',
        backgroundColor: '#000',
        boxShadow: '1px 1px 0px #fff',
        innerShadow: '0px 0px 5px rgba(0, 0, 0, 0.5)',
        placeHolder: ''
    });
    this.myInput.inputEnabled = true;
    this.myInput.input.useHandCursor = true;    
    this.myInput.events.onInputUp.add(this.inputFocus, this);

    return this.myInput;
}

Nickname.prototype.inputFocus = function(sprite) {
    sprite.canvasInput.focus();
}

Nickname.prototype.lobby = function() {
    network_player.setName(this.myInput.canvasInput._value);
    game.state.start('Lobby');
}

Nickname.prototype.quit = function() {
    game.state.start('Welcome');
}
