// var game;
// var leverArea;
// var leverTrigger;

function Lever(game) {
    this.game = game;
}

Lever.prototype.preload = function(){
}

Lever.prototype.create = function() {
    this.leverArea = new Phaser.Rectangle(this.game.world.centerX, this.game.world.centerY, 50, 250);
    this.leverTrigger = new Phaser.Rectangle(this.game.world.centerX, this.game.world.centerY, 50, 25);
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