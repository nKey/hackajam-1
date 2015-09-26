var game;
var leverArea;
var leverTrigger;
var x;
var y;
var width;
var height;
var leverSprite;

function Lever(game, x, y, width, height) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

Lever.prototype.preload = function() {
    game.load.atlasJSONHash('bot', 'lever.png', 'lever.json');
}

Lever.prototype.create = function() {
    this.leverArea = new Phaser.Rectangle(this.x, this.y, this.width, this.height);
    this.leverTrigger = new Phaser.Rectangle(this.x, this.y, this.width, this.height/1.5);
    leverSprite = game.add.sprite(0, 0, 'bot');
    leverSprite.x = this.x + leverSprite.width / 2;
    leverSprite.y = this.y + leverSprite.height / 2;
    leverSprite.anchor.setTo(0.5, 0.5);

    leverSprite.animations.add('run');
}

Lever.prototype.update = function() {
    if (this.game.input.activePointer.isDown) {
        if (this.leverTrigger.contains(this.game.input.x, this.game.input.y) &&
            this.game.input.y - this.leverTrigger.height/2 > this.leverArea.y &&
            this.game.input.y + this.leverTrigger.height - this.leverTrigger.height/2 < this.leverArea.y + this.leverArea.height) {
            this.leverTrigger.y = this.game.input.y - this.leverTrigger.height/2;

            normalizedLeverValue = (this.leverTrigger.y - this.leverArea.y) / (this.leverArea.height - this.leverTrigger.height);
            leverSprite.animations.frame = Math.ceil(normalizedLeverValue * leverSprite.animations.frameTotal) - 1;
        }
    }
}

Lever.prototype.render = function() {
    if (DEBUG) {
       this.game.debug.geom(this.leverArea, "#555555");
       this.game.debug.geom(this.leverTrigger, "#00DDDD");
   }
}