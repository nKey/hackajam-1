var game;
var tank;
var turret;
var cursors;
var shadow;
var bullets;
var explosions;
var currentSpeed = 0;

var nextFire = 0;
var blockedLayer;

// Moviment controls
var tankAngle = 0;
var turretAngle;

var fireCallback;
var bulletsIndicator;
var smile;
var smileChanged;

function Tank(game) {
    this.game = game;

    this.currentSpeed = 0;
    this.fireReloadDelay = 2600;
    this.nextFire = 0;
    this.tankAngle = 0;
    this.turretAngle = 0;
    this.numberOfBullets = 5;
}

Tank.prototype.preload = function() {
    this.game.load.atlas('tank', 'game/assets/tank.png', 'game/assets/tank.json');
    this.game.load.image('bullet', 'game/assets/bullet.png');
    this.game.load.spritesheet('kaboom', 'game/assets/explosion.png', 64, 64, 23);
    this.game.load.audio('tankFireSound', ['game/assets/sound/tank_fire.ogg']);
}

Tank.prototype.create = function(blockedLayer){
    this.blockedLayer = blockedLayer;
    this.setupTank();
    //  Our bullet group
    this.bullets = this.game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.createMultiple(30, 'bullet', 0, false);
    this.bullets.setAll('anchor.x', 0.5);
    this.bullets.setAll('anchor.y', 0.5);
    this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('checkWorldBounds', true);

    //  Explosion pool
    this.explosions = this.game.add.group();

    for (var i = 0; i < 10; i++) {
        var explosionAnimation = this.explosions.create(0, 0, 'kaboom', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('kaboom');
    }

    this.game.camera.follow(this.tank);
    this.game.camera.deadzone = new Phaser.Circle(this.game.width/2, this.game.height/2, 60, 60);

    if (DEBUG) {
        this.createDebugControls();
    }
}

Tank.prototype.setupTank = function() {
    this.tank = this.game.add.sprite(0, 0, 'tank', 'tank_base.png');
    this.tank.anchor.setTo(0.5, 0.5);

    this.game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.drag.set(0.2);
    this.tank.body.maxVelocity.setTo(400, 400);
    this.tank.body.collideWorldBounds = true;

    this.turret = this.game.add.sprite(0, 0, 'tank', 'tank_turret.png');
    this.turret.anchor.setTo(0.19, 0.5);

    this.shadow = this.game.add.sprite(0, 0, 'tank', 'tank_shadow.png');
    this.shadow.anchor.setTo(0.45, 0.45);

    this.tank.bringToTop();
    this.turret.bringToTop();


    //fix to tank start on center of view
    //should change game.camera view, but i've facing a issue that camera does not follow tank anymore
    this.tank.x = 600;
    this.tank.y = 300;
    this.angle = 0;
    this.tankAngle = 0;
    this.turretAngle = 0;

    this.game.camera.follow(this.tank);
    this.game.camera.focusOnXY(600,300);
}

Tank.prototype.update = function () {
    this.game.physics.arcade.collide(this.tank, this.blockedLayer);

    currentSpeed = this.currentSpeed;
    this.tank.angle = this.tank.angle + this.tankAngle;

    this.game.physics.arcade.velocityFromRotation(this.tank.rotation, currentSpeed, this.tank.body.velocity);

    //  Position all the parts and align rotations
    this.shadow.x = this.tank.x;
    this.shadow.y = this.tank.y;
    this.shadow.rotation = this.tank.rotation;

    this.turret.x = this.tank.x;
    this.turret.y = this.tank.y;

    this.turret.rotation = this.tank.rotation + this.turretAngle;

    if (DEBUG) {
        this.updateDebugControls();
    }
}

Tank.prototype.fire = function () {
    if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0 && this.numberOfBullets > 0) {
        this.numberOfBullets--;
        this.nextFire = this.game.time.now + this.fireReloadDelay;
        var bullet = this.bullets.getFirstExists(false);
        bullet.reset(this.turret.x, this.turret.y);
        bullet.rotation = this.turret.rotation;
        bullet.body.velocity = this.game.physics.arcade.velocityFromAngle(bullet.angle, 300);
        this.turret.bringToTop();

        sound = game.add.audio('tankFireSound');
        sound.play();

        this.fireCallback();
    }
}

Tank.prototype.createDebugControls = function () {
   this.cursors = this.game.input.keyboard.createCursorKeys();
}

Tank.prototype.updateDebugControls = function () {
    if (this.cursors.left.isDown) {
        this.tank.angle -= 4;
    } else if (this.cursors.right.isDown) {
        this.tank.angle += 4;
    }

    if (this.cursors.up.isDown) {
        //  The speed we'll travel at
        currentSpeed = 200;
    } else {
        if (currentSpeed > 0) {
            currentSpeed -= 4;
        }
    }

    if (currentSpeed > 0) {
        this.game.physics.arcade.velocityFromRotation(this.tank.rotation, currentSpeed, this.tank.body.velocity);
    }
}

Tank.prototype.fireCallback = function () {
    for (var i = 0; i < 5; i++) {
        this.bulletsIndicator[i].visible = (i < this.numberOfBullets);
    }

    this.hideSmileAndShowSmileChanged();
    setTimeout(this.hideSmileChangedAndShowSmile, 1000, this.smile, this.smileChanged);
}

Tank.prototype.insertBulletIndicator = function(bulletsIndicator, smile, smileChanged) {
    this.bulletsIndicator = bulletsIndicator;
    this.smile = smile;
    this.smileChanged  = smileChanged;
}

Tank.prototype.hideSmileAndShowSmileChanged = function() {
    this.smile.visible = false;
    this.smileChanged.visible = true;
}

Tank.prototype.hideSmileChangedAndShowSmile = function(smile, smileChanged) {
    smile.visible = true;
    smileChanged.visible = false;
}

Tank.prototype.broadcastPosition = function() {
    game.network.dead_reckoning(this.tank.x, this.tank.y, this.tank.angle);
}

Tank.prototype.updatePosition = function(x, y, angle){
    this.tank.x = x;
    this.tank.y = y;
    this.tank.angle = angle;
}
