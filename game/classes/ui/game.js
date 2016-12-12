
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
    if (this.DEBUG === undefined) {
        this.DEBUG = false;
    }
}

Game.prototype.preload = function() {
    this.map = new Map(this.game);
    this.tank = new Tank(this.game);
    this.enemy = new EnemyTank(this.game, this.tank);
    this.game.load.spritesheet('missionCompleted', 'game/assets/mission_completed.png');
    this.game.load.spritesheet('missionFailure', 'game/assets/mission_failure.png');
    this.game.load.spritesheet('smile', 'game/assets/smile.png');
    this.game.load.spritesheet('smileChanged', 'game/assets/smile_changed.png');
    this.game.load.spritesheet('bulletIndicator', 'game/assets/bullet_indicator.png');
    this.game.load.audio('gameMusic', ['game/assets/sound/game_music.mp3']);
    this.game.load.audio('victoryExplosion', ['game/assets/sound/victory_explosion.mp3']);

    if (game.thisPlayer.number == 1) {
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

    //this keeps js running even if in background or user removed focus from browser
    game.stage.disableVisibilityChange = true;

    var self = this;
    var tank = this.tank;
    Network.turretMoved = function(angle) {
        self.moveTurret(angle);
    }
    Network.turretFired = function() {
        tank.fire();
    }
    Network.tankMoved = function(velocity, rotation) {
        self.moveTank(velocity, rotation);
    }
}

Game.prototype.create = function() {
    this.map.create();
    this.tank.create(this.map.blockedLayer);
    this.enemy.create(this.map.blockedLayer);
    this.interfacePlayer = this.game.add.image(0, 0, 'interfacePlayer');
    this.interfacePlayer.fixedToCamera = true;
    if (game.thisPlayer.number == 1) {
        this.fireButton = this.game.add.button(38, 351, 'fireButton', game.network.action_fire, game.network, 2, 1, 0);
        this.fireButton.fixedToCamera = true;
        this.createSmileLeft();
        this.game.time.events.loop(networkLag, this.tank.broadcastPosition, this.tank);
    } else {
        this.crank.create();
        this.crank.crank.fixedToCamera = true;
        this.createSmileRight();
        var tank = this.tank;

        game.network.game_dead_reckoning = function(x, y, angle){
            tank.tank.x = x;
            tank.tank.y = y;
            tank.tank.angle = angle;
        }
    }
    this.lever.create();

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
    if (game.thisPlayer.number == 2) {
        this.crank.update();
    }
    this.lever.update();
    this.tank.update();
    this.enemy.update();
    if (!this.hasAlert()) {
        if (this.enemy.health <= 0) {
            this.missionCompleted();
        } else if (this.tank.numberOfBullets <= 0) {
            this.missionFailed();
        }
    }
}

Game.prototype.hasAlert = function() {
    return this.missionFailedAlert != undefined || this.missionCompletedAlert != undefined;
}

Game.prototype.render = function() {
    if (game.thisPlayer.number == 2) {
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

Game.prototype.missionCompleted = function() {
    this.missionCompletedAlert = this.game.add.image(360, 190, 'missionCompleted');
    this.missionCompletedAlert.fixedToCamera = true;

    sound = game.add.audio('victoryExplosion');
    sound.play();
}

Game.prototype.missionFailed = function() {
    this.missionFailedAlert = this.game.add.image(400, 218, 'missionFailure');
    this.missionFailedAlert.fixedToCamera = true;
}
