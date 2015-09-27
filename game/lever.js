var game;
var leverArea;
var leverTrigger;
var x;
var y;
var width;
var height;
var leverSprite;
var leverVelocity;
var direction;

function Lever(game, x, y, width, height, direction) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.direction = direction;
}

Lever.prototype.preload = function() {
    game.load.atlasJSONHash('bot', 'game/assets/lever.png', 'game/assets/lever.json');
}

Lever.prototype.create = function() {
    this.leverArea = new Phaser.Rectangle(this.x, this.y, this.width, this.height);
    this.leverTrigger = new Phaser.Rectangle(this.x, this.y, this.width, this.height/1.5);
    this.leverSprite = game.add.sprite(0, 0, 'bot');
    this.leverSprite.x = this.x + this.leverSprite.width / 2;
    this.leverSprite.y = this.y + this.leverSprite.height / 2;
    this.leverSprite.anchor.setTo(0.5, 0.5);

    this.leverSprite.animations.add('run');

    this.leverSprite.fixedToCamera = true;
    this.leverArea.fixedToCamera = true;
    this.leverTrigger.fixedToCamera = true;
}

Lever.prototype.update = function() {
    if (this.game.input.activePointer.isDown) {
        if (this.leverTrigger.contains(this.game.input.x, this.game.input.y) &&
            this.game.input.y - this.leverTrigger.height/2 > this.leverArea.y &&
            this.game.input.y + this.leverTrigger.height - this.leverTrigger.height/2 < this.leverArea.y + this.leverArea.height) {
            this.leverTrigger.y = this.game.input.y - this.leverTrigger.height/2;

            normalizedLeverValue = (this.leverTrigger.y - this.leverArea.y) / (this.leverArea.height - this.leverTrigger.height);
            this.leverSprite.animations.frame = Math.ceil(normalizedLeverValue * this.leverSprite.animations.frameTotal) - 1;
            if(this.direction == 'left'){
                network_handlers.control_lever_left(this.leverSprite.animations.frame);
            }else if(this.direction == 'right'){
                network_handlers.control_lever_right(this.leverSprite.animations.frame);
            }
            
        }
    }
}

Lever.prototype.render = function() {
}