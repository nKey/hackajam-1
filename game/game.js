
var game;
var lever;
var crank;
var map;
var tank;
var enemy;
var DEBUG;
var playerNumber;
var bulletsIndicator;

function game_init(player) {
    if (DEBUG == undefined) {
        DEBUG = false;
    }
    if (playerNumber == undefined) {
        playerNumber = 1;
    }
    game = new Phaser.Game(1200, 600, Phaser.AUTO, 'game', {
        preload: preload, create: create, update: update, render: render });
}

function preload() {
    map = new Map(game);
    tank = new Tank(game);
    enemy = new EnemyTank(game, tank);
    game.load.spritesheet('bulletIndicator', 'game/assets/bullet_indicator.png');
    game.load.audio('gameMusic', ['game/assets/sound/game_music.mp3']);
    if (playerNumber == 1) {
        lever = new Lever(game, 1000, 305, 107, 294, 'right');
        game.load.spritesheet('fireButton', 'game/assets/fire_button.png');
        game.load.spritesheet('interfacePlayer', 'game/assets/interface_player_2_background.png');
    } else {
        lever = new Lever(game, 100, 305, 107, 294, 'left');
        crank = new Crank(game, 1000, 450, 300);
        game.load.spritesheet('interfacePlayer', 'game/assets/interface_player_1_background.png');
        crank.preload();
    }
    map.preload();
    tank.preload();
    enemy.preload();
    lever.preload();
}

function create() {
    map.create();
    tank.create(map.blockedLayer);
    enemy.create(map.blockedLayer);
    interfacePlayer = game.add.image(0, 0, 'interfacePlayer');
    interfacePlayer.fixedToCamera = true;

    if (playerNumber == 1) {
        fireButton = game.add.button(38, 351, 'fireButton', network_handlers.action_fire, this, 2, 1, 0);
        fireButton.fixedToCamera = true;
    } else {
        crank.create();
        crank.crank.fixedToCamera = true;
    }
    lever.create();

    createNumberOfBulletsIndicator();
    tank.fireCallback = function () {
        updateNumberOfBulletsIndicator();
    };

    musicPlayer = game.add.audio('gameMusic', 0.2, false);
    musicPlayer.play('', 0, 0.2, false);
}

function createNumberOfBulletsIndicator() {
    bulletsIndicator = [];
    for (var i = 0; i < this.tank.numberOfBullets; i++) {
        bulletIndicator = this.game.add.image(25 + (54 * i), 15, 'bulletIndicator');
        bulletIndicator.fixedToCamera = true;
        bulletsIndicator[i] = bulletIndicator;
    };
}

function updateNumberOfBulletsIndicator() {
    for (var i = 0; i < 5; i++) {
        bulletsIndicator[i].visible = (i < tank.numberOfBullets);
    }
}

function update() {
    map.update();
    if (playerNumber == 2) {
        crank.update();
    }
    lever.update();
    tank.update();
    enemy.update();

}

function render() {
    if (playerNumber == 2) {
        crank.render();
    }
    lever.render();
    map.render();
}

function moveTank(movement, rotation){
    tank.currentSpeed = movement * 50;
    tank.tankAngle = rotation/3;
} 

function moveTurret(angle) {
    tank.turretAngle = angle;

}

function turretFire() {
    tank.fire();
}