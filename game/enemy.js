
var game;
var player;
var tank;
var turret;
var shadow;
var bullets;
var health;
var explosions;
var cursors;

var nextFire = 0;

var blockedLayer;

function EnemyTank(game, player) {
    this.game = game;
    this.player = player;
    this.health = 2;

    this.fireReloadDelay = 2600;
    this.nextFire = 0;
}

EnemyTank.prototype.preload = function() {
    this.game.load.atlas('tank2', 'game/assets/tank_2.png', 'game/assets/tank_2.json');
}

EnemyTank.prototype.create = function(blockedLayer){
    this.blockedLayer = blockedLayer;
    this.setupTank();

    
    this.explosions = this.game.add.group();

    //creating a single explosion
    var explosionAnimation = this.explosions.create(0, 0, 'kaboom', [0], false);
    explosionAnimation.anchor.setTo(0.5, 0.5);
    explosionAnimation.animations.add('kaboom');
}

EnemyTank.prototype.setupTank = function() {
    this.tank = this.game.add.sprite(0, 0, 'tank2', 'tank_base_2.png');
    this.tank.anchor.setTo(0.5, 0.5);

    this.game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.drag.set(0.2);
    this.tank.body.maxVelocity.setTo(400, 400);
    this.tank.body.collideWorldBounds = true;

    this.turret = this.game.add.sprite(0, 0, 'tank2', 'tank_turret_2.png');
    this.turret.anchor.setTo(0.19, 0.5);

    this.shadow = this.game.add.sprite(0, 0, 'tank2', 'tank_shadow.png');
    this.shadow.anchor.setTo(0.45, 0.45);

    this.tank.bringToTop();
    this.turret.bringToTop();

    this.tank.x = 600;
    this.tank.y = 350;
}

EnemyTank.prototype.update = function () {
    this.game.physics.arcade.collide(this.tank, this.blockedLayer);
    this.game.physics.arcade.collide(this.tank, this.player.tank);
    this.game.physics.arcade.overlap(this.player.bullets, this.tank, bulletHitEnemy, null, this);

    //  Position all the parts and align rotations
    this.shadow.x = this.tank.x;
    this.shadow.y = this.tank.y;
    this.shadow.rotation = this.tank.rotation;

    this.turret.x = this.tank.x;
    this.turret.y = this.tank.y;

    this.turret.rotation = this.tank.rotation;
}

function bulletHitEnemy(tank, bullet) {
    bullet.kill();
    var destroyed = this.damage();
    if (destroyed) {
        var explosionAnimation = this.explosions.getFirstExists(false);

        explosionAnimation.reset(tank.x, tank.y);
        explosionAnimation.play('kaboom', 30, false, true);
    }
}

EnemyTank.prototype.damage = function() {
    this.health -= 1;
    if (this.health <= 0) {
        this.alive = false;

        this.shadow.kill();
        this.tank.kill();
        this.turret.kill();

        return true;
    }
    return false;
}