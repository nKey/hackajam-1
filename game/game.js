var game = new Phaser.Game(1200, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

var lever;
var crank;
var map;
var tank;
var DEBUG = false;

function preload() {
    map = new Map(game);
    tank = new Tank(game);
    crank = new Crank(game, 1000, 450, 300);
    // lever = new Lever(game, 20, 20, 50, 200)
    game.load.spritesheet('fireButton', 'assets/fire_button.png');
    game.load.spritesheet('interfacePlayer2', 'assets/interface_player_2_background.png');
    map.preload();
    tank.preload();
    crank.preload();
    // lever.preload();
}

function create() {
    map.create();
    tank.create(map.blockedLayer);
    interfacePlayer = game.add.image(0, 0, 'interfacePlayer2');
    interfacePlayer.fixedToCamera = true;
    fireButton = game.add.button(38, 351, 'fireButton', tank.fire, tank, 2, 1, 0);
    fireButton.fixedToCamera = true;
    crank.create();
    // crank.crank.fixedToCamera = true;
    // lever.create();
}

function update() {
    crank.update();
    console.log(crank.getAngle());
    // lever.update();
    tank.update(crank.angle);
}

function render() {
    crank.render();
    // lever.render();
}