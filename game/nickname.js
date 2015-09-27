function Nickname(){
}

var myInput;

Nickname.prototype.preload = function() {
    game.load.image('background', 'game/assets/nickname_screen.png');
    game.load.image('ok_button', 'game/assets/button_ok.png');
    game.load.image('cancel_button', 'game/assets/button_cancel.png');
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;    
    this.scale.pageAlignHorizontally = true;
    this.scale.updateLayout();
}

Nickname.prototype.create = function () {
    game.add.sprite(0, 0, 'background');
    
    this.myInput = this.createInput(this.game.world.centerX, this.game.world.centerY + 100);
    this.myInput.anchor.set(0.5);

    this.myInput.canvasInput.value(network_player.name);
    
    var buttonCache = game.cache.getImage('cancel_button');
    var button = this.add.button(game.world.centerX - buttonCache.width - 10, 
                                     game.world.height - 180, 'cancel_button',  this.back, this);


    var buttonCache = game.cache.getImage('ok_button');
    var button = this.add.button(game.world.centerX + 10, 
                                     game.world.height - 180, 'ok_button',  this.lobby, this);

     
}

Nickname.prototype.createInput = function(x, y) {
    var bmd = this.add.bitmapData(350, 110);    
    this.myInput = this.game.add.sprite(x, y, bmd);

    this.myInput.canvasInput = new CanvasInput({
        canvas: bmd.canvas,
        fontSize: 30,
        fontFamily: 'Arial',
        fontColor: '#4F4843',
        fontWeight: 'bold',
        width: 400,
        padding: 8,
        borderWidth: 0,
        backgroundColor: '#C6BAA3',
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
    if (this.myInput.canvasInput._value == "") {
        network_player.setName("untitled");
    } else {
        network_player.setName(this.myInput.canvasInput._value);
    }
    network_callbacks.game_room_did_join = function (game_id, players) {
        refreshPlayerNumber(players);
        var lobby = game.state.start('Lobby', true, false, players);
    };
    network_handlers.game_room_join();
};

function refreshPlayerNumber (players) {
    if (players != undefined) {
        var player1 = undefined;
        $.each(players, function(player_id, player){
            player.id = player_id;
            if (player1 == undefined) {
                player1 = player;
                player1.number = 1;
            } else {
                if (String(player_id).localeCompare(String(player1.id))) {
                    player1.number = 2;
                    player1 = player;
                    player1.number = 1;
                } else {
                    player.number = 2;
                }
            }
        });
        if (player1 != network_player) {
            network_player.number = 2;
        }
    }
}

Nickname.prototype.back = function() {
    game.state.start('Menu');
}
