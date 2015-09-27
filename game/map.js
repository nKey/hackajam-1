var game;

function Map(game){
    this.game = game;
}

Map.prototype.preload = function() {
    this.game.load.tilemap('map1', 'game/tilemap/map1.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('gameTiles', 'game/tilemap/tiles.png');
}

Map.prototype.create = function() {
    this.setupTilemap();
}

Map.prototype.update = function() {
    
}

Map.prototype.render = function() {
}

Map.prototype.setupTilemap = function() {
    this.map = this.game.add.tilemap('map1');
    this.map.addTilesetImage('tiles', 'gameTiles');

    this.backgroundlayer = this.map.createLayer('backgroundLayer');
    this.blockedLayer = this.map.createLayer('blockedLayer');
    
    this.map.setCollisionBetween(1, 1000, true, 'blockedLayer');

    this.backgroundlayer.resizeWorld();
}