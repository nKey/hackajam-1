var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

var lever;
var crank;
var DEBUG = true;

function preload() {
    game.stage.backgroundColor = '#DDDDDD';
    // crank = new Crank(game, game.world.centerX, game.world.centerY, 400);
    lever = new Lever(game, 20, 20, 50, 200)
    // crank.preload();
    lever.preload();
}

function create() {
    // crank.create();
    lever.create();
}

function update() {
    // crank.update();
    lever.update();
}

function render() {
    // crank.render();
    lever.render();
}