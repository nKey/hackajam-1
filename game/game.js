
var game;
var lever;
var crank;
var map;
var tank;
var enemy;
var DEBUG;
var playerNumber;
var bulletsIndicator;

function Game(game) {
    this.game = game;
}

Game.prototype.init = function() {
    if (this.DEBUG == undefined) {
        this.DEBUG = false;
    }
    if (this.playerNumber == undefined) {
        this.playerNumber = 1;
    }
}

Game.prototype.preload = function() {
    this.map = new Map(this.game);
    this.tank = new Tank(this.game);
    this.enemy = new EnemyTank(this.game, this.tank);
    this.game.load.spritesheet('smile', 'game/assets/smile.png');
    this.game.load.spritesheet('smileChanged', 'game/assets/smile_changed.png');
    this.game.load.spritesheet('bulletIndicator', 'game/assets/bullet_indicator.png');
    this.game.load.audio('gameMusic', ['game/assets/sound/game_music.mp3']);
    if (this.playerNumber == 1) {
        this.lever = new Lever(this.game, 1000, 305, 107, 294, 'right');
        this.game.load.spritesheet('fireButton', 'game/assets/fire_button.png');
        this.game.load.spritesheet('interfacePlayer', 'game/assets/interface_player_2_background.png');
    } else {
        this.lever = new Lever(this.game, 100, 305, 107, 294, 'left');
        this.crank = new Crank(this.game, 1000, 450, 300);
        this.game.load.spritesheet('interfacePlayer', 'game/assets/interface_player_1_background.png');
        this.crank.preload();
    }

    this.map.preload();
    this.tank.preload();
    this.enemy.preload();
    this.lever.preload();
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.updateLayout();
}

Game.prototype.create = function() {
    this.map.create();
    this.tank.create(this.map.blockedLayer);
    this.enemy.create(this.map.blockedLayer);
    this.interfacePlayer = this.game.add.image(0, 0, 'interfacePlayer');
    this.interfacePlayer.fixedToCamera = true;
    if (this.playerNumber == 1) {
        this.fireButton = this.game.add.button(38, 351, 'fireButton', network_handlers.action_fire, this.tank, 2, 1, 0);
        this.fireButton.fixedToCamera = true;
        this.createSmileLeft();
    } else {
        this.crank.create();
        this.crank.crank.fixedToCamera = true;
        this.createSmileRight();
    }
    this.lever.create();

    // tank.fireCallback = function () {
    //     updateNumberOfBulletsIndicator();
    //     hideSmileAndShowSmileChanged();
    //     setTimeout(hideSmileChangedAndShowSmile, 1000);
    // };

    musicPlayer = game.add.audio('gameMusic', 0.2, false);
    musicPlayer.play('', 0, 0.2, false);

    this.createNumberOfBulletsIndicator();
}

Game.prototype.createSmileLeft = function() {
    this.smile = this.game.add.image(85, 168, 'smile');
    this.smile.fixedToCamera = true;
    this.smileChanged = this.game.add.image(85, 168, 'smileChanged');
    this.smileChanged.fixedToCamera = true;
    this.smileChanged.visible = false;
}

Game.prototype.createSmileRight = function() {
    this.smile = this.game.add.image(970, 155, 'smile');
    this.smile.fixedToCamera = true;
    this.smileChanged = this.game.add.image(970, 155, 'smileChanged');
    this.smileChanged.fixedToCamera = true;
    this.smileChanged.visible = false;
}

Game.prototype.createNumberOfBulletsIndicator = function() {
    this.bulletsIndicator = [];
    for (var i = 0; i < this.tank.numberOfBullets; i++) {
        this.bulletIndicator = this.game.add.image(25 + (54 * i), 15, 'bulletIndicator');
        this.bulletIndicator.fixedToCamera = true;
        this.bulletsIndicator[i] = this.bulletIndicator;
    };
    this.tank.insertBulletIndicator(this.bulletsIndicator, this.smile, this.smileChanged);
}

Game.prototype.update = function() {
    this.map.update();
    if (this.playerNumber == 2) {
        this.crank.update();
    }
    this.lever.update();
    this.tank.update();
    this.enemy.update();
}

Game.prototype.render = function() {
    if (this.playerNumber == 2) {
        this.crank.render();
    }
    this.lever.render();
    this.map.render();
}

Game.prototype.moveTank = function(movement, rotation) {
    this.tank.currentSpeed = movement * 50;
    this.tank.tankAngle = rotation/3;
} 

Game.prototype.moveTurret = function(angle) {
    this.tank.turretAngle = angle;
}

Game.prototype.turretFire = function() {
    this.tank.fire();
}