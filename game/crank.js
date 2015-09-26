var axisSize = 50;
var crank;
var outCircle;
var inCircle;
var buttonCircle;

var centerX;
var centerY;
var diameter;

var angle;

function Crank(game, centerX, centerY, diameter) {
    this.game = game;
    this.centerX = centerX;
    this.centerY = centerY;
    this.diameter = diameter;
    this.assetSize = (this.diameter/4)*3;
}

Crank.prototype.preload = function() {
    this.game.load.image('crank', 'assets/crank.png');
}

Crank.prototype.create = function() {
    this.outCircle = new Phaser.Circle(this.centerX, this.centerY, this.diameter);
    this.inCircle = new Phaser.Circle(this.outCircle.x, this.outCircle.y, axisSize);
    buttonCircleSize = this.diameter/2 - axisSize/2;
    this.buttonCircle = new Phaser.Circle(this.outCircle.x + buttonCircleSize/2 + axisSize/2, this.outCircle.y, buttonCircleSize);

    this.crank = this.game.add.sprite(this.centerX, this.centerY, 'crank');
    this.crank.anchor.setTo(0.5, 0.5);
    this.crank.height = this.assetSize;
    this.crank.width = this.assetSize;
    this.crank.fixedToCamera = true;
    this.outCircle.fixedToCamera = true;
    this.inCircle.fixedToCamera = true;
    this.buttonCircle.fixedToCamera = true;
}

Crank.prototype.update = function() {
    if (this.game.input.activePointer.isDown) {
        if (this.buttonCircle.contains(this.game.input.x, this.game.input.y)) {
            angleRadius = this.getAngle();
            this.buttonCircle.x = this.outCircle.x + (this.outCircle.radius - this.buttonCircle.radius) * Math.cos(angleRadius);
            this.buttonCircle.y = this.outCircle.y + (this.outCircle.radius - this.buttonCircle.radius) * Math.sin(angleRadius);
            this.crank.angle = angleRadius * (180 / Math.PI); 
            this.angle = angleRadius;
        }
    }
}

Crank.prototype.render = function() {
    if (DEBUG) {
        this.game.debug.geom(this.outCircle);
        this.game.debug.geom(this.inCircle, "#FFFFFF");
        this.game.debug.geom(this.buttonCircle, '#000000');
    } 
}

Crank.prototype.getAngle = function() {
    var angleRadius = -Math.atan2(this.game.input.x - this.inCircle.x, this.game.input.y - this.inCircle.y) + (Math.PI / 2);
    if (angleRadius < 0) {
        angleRadius += Math.PI * 2;
    }
    return angleRadius
}