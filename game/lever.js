var game;
var leverArea;
var leverTrigger;
var x;
var y;
var width;
var height;

function Lever(game, x, y, width, height) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

Lever.prototype.preload = function(){

    game.load.atlasJSONHash('bot', 'lever.png', 'lever.json');

}

Lever.prototype.create = function() {
    this.leverArea = new Phaser.Rectangle(this.x, this.y, this.width, this.height);
    this.leverTrigger = new Phaser.Rectangle(this.x, this.y, this.width, this.height/10);
    s = game.add.sprite(this.x, this.y, 'bot');
    s.anchor.setTo(0.5, 0.5);
    s.scale.setTo(2, 2);

    s.animations.add('run');
    s.animations.play('run', 10, true);
}

Lever.prototype.update = function() {
    if (this.game.input.activePointer.isDown) {
        if (this.leverTrigger.contains(this.game.input.x, this.game.input.y) &&
            this.game.input.y - this.leverTrigger.height/2 > this.leverArea.y &&
            this.game.input.y + this.leverTrigger.height - this.leverTrigger.height/2 < this.leverArea.y + this.leverArea.height) {
            this.leverTrigger.y = this.game.input.y - this.leverTrigger.height/2;
        }
    }
}

Lever.prototype.render = function() {
    if (DEBUG) {
       this.game.debug.geom(this.leverArea, "#555555");
       this.game.debug.geom(this.leverTrigger, "#00DDDD");
   }
}