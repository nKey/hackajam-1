var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

var lever = new Lever(game);
var DEBUG = true;

function preload() {
    game.stage.backgroundColor = '#DDDDDD';
    
    lever.preload();
}

function create() {
    lever.create();
    
}

function update() {
    lever.update();
    
}

function render() {
    lever.render()
   
}