var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });
var assetSize = 300;
var touchSize = 400;
var axisSize = 50;
var crank;
var outCircle;
var inCircle;
var buttonCircle;

var DEBUG = true;

function preload() {
    game.stage.backgroundColor = '#DDDDDD';
    game.load.image('crank', 'crank.png');
}

function create() {
    outCircle = new Phaser.Circle(game.world.centerX, game.world.centerY, touchSize);
    inCircle = new Phaser.Circle(outCircle.x, outCircle.y, axisSize);
    buttonCircleSize = touchSize/2 - axisSize/2;
    buttonCircle = new Phaser.Circle(outCircle.x + buttonCircleSize/2 + axisSize/2, outCircle.y, buttonCircleSize);

    crank = game.add.sprite(game.world.centerX, game.world.centerY, 'crank');
    crank.anchor.setTo(0.5, 0.5);
    crank.height = assetSize;
    crank.width = assetSize;
}

function update() {
    if (game.input.activePointer.isDown) {
        if (buttonCircle.contains(game.input.x, game.input.y)) {
            angleRadius = getAngle();
            buttonCircle.x = outCircle.x + (outCircle.radius - buttonCircle.radius) * Math.cos(angleRadius);
            buttonCircle.y = outCircle.y + (outCircle.radius - buttonCircle.radius) * Math.sin(angleRadius);
            crank.angle = angleRadius * (180 / Math.PI); 
        }
    }
}

function render() {
    if (DEBUG) {
        game.debug.geom(outCircle);
        game.debug.geom(inCircle, "#FFFFFF");
        game.debug.geom(buttonCircle, '#000000');
    } 
}

function getAngle(){
    var angleRadius = -Math.atan2(game.input.x - inCircle.x, game.input.y - inCircle.y) + (Math.PI / 2);
    if (angleRadius < 0) {
        angleRadius += Math.PI * 2;
    }
    return angleRadius
}