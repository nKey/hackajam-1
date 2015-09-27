
var game;
var lever;
var crank;
var map;
var tank;
var DEBUG = false;
var playerNumber;

function game_init(player) {
    if(player == undefined){
        playerNumber = 1;
    }
    game = new Phaser.Game(1200, 600, Phaser.AUTO, 'game', {
        preload: preload, create: create, update: update, render: render });
}

function preload() {
    map = new Map(game);
    tank = new Tank(game);
    if(playerNumber == 1){
        lever = new Lever(game, 1000, 305, 107, 294)
        game.load.spritesheet('fireButton', 'game/assets/fire_button.png');
        game.load.spritesheet('interfacePlayer', 'game/assets/interface_player_2_background.png');
    }else{
        lever = new Lever(game, 100, 305, 107, 294)
        crank = new Crank(game, 1000, 450, 300);
        game.load.spritesheet('interfacePlayer', 'game/assets/interface_player_1_background.png');
        crank.preload();
    }
    map.preload();
    tank.preload();
    
    lever.preload();
}

function create() {
    map.create();
    tank.create(map.blockedLayer);
    interfacePlayer = game.add.image(0, 0, 'interfacePlayer');
    interfacePlayer.fixedToCamera = true;
    if(playerNumber == 1){
        fireButton = game.add.button(38, 351, 'fireButton', tank.fire, tank, 2, 1, 0);
        fireButton.fixedToCamera = true;
    }else{
        crank.create();
        crank.crank.fixedToCamera = true;
    }
    lever.create();
}

function update() {
    map.update();
    if(playerNumber == 2){
        crank.update();
        tank.turretAngle = crank.angle;
    }
    // console.log(crank.getAngle());
    lever.update();
    tank.update();

}

function render() {
    if(playerNumber == 2){
        crank.render();
    }
    lever.render();
    map.render();
}

function moveTank(movement, rotation){
    tank.currentSpeed = movement * 10;
    tank.tankAngle = rotation/10;
} 