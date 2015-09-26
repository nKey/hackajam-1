var game = new Phaser.Game(1200, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });
var player = 2;

function preload () {
    game.load.atlas('tank', 'assets/tank.png', 'assets/tank.json');
    game.load.atlas('enemy', 'assets/enemy-tanks.png', 'assets/tank.json');
    game.load.image('bullet', 'assets/bullet.png');

    game.load.tilemap('map1', 'tilemap/map1.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('gameTiles', 'tilemap/tiles.png');

    game.load.spritesheet('kaboom', 'assets/explosion.png', 64, 64, 23);
    
    game.load.spritesheet('fireButton', 'assets/fire_button.png', 219, 192);

    if (player == 1) {
        preloadForPlayer1();
    } else {
        preloadForPlayer2();
    }
}

function preloadForPlayer1() {
    game.load.spritesheet('interfacePlayer1', 'assets/interface_player_1_background.png');
}

function preloadForPlayer2() {
    game.load.spritesheet('interfacePlayer2', 'assets/interface_player_2_background.png');
}

var tank;
var turret;
var shadow;

var explosions;

var currentSpeed = 0;
var cursors;

var bullets;
var fireReloadDelay = 300;
var nextFire = 0;

//map
var blockedLayer;

//panel
var fireButton;

function create () {
    setupTilemap();
    setupTank();

    //  Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet', 0, false);
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    //  Explosion pool
    explosions = game.add.group();

    for (var i = 0; i < 10; i++) {
        var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('kaboom');
    }

    game.camera.follow(tank);
    game.camera.deadzone = new Phaser.Circle(game.width/2, game.height/2, 60, 60);

    cursors = game.input.keyboard.createCursorKeys();

    setupPanel();
}

function setupTilemap() {
    map = game.add.tilemap('map1');
    map.addTilesetImage('tiles', 'gameTiles');

    backgroundlayer = map.createLayer('backgroundLayer');
    blockedLayer = map.createLayer('blockedLayer');
    
    map.setCollisionBetween(1, 1000, true, 'blockedLayer');

    backgroundlayer.resizeWorld();
}

function setupTank() {
    tank = game.add.sprite(0, 0, 'tank', 'tank_base.png');
    tank.anchor.setTo(0.5, 0.5);

    game.physics.enable(tank, Phaser.Physics.ARCADE);
    tank.body.drag.set(0.2);
    tank.body.maxVelocity.setTo(400, 400);
    tank.body.collideWorldBounds = true;

    turret = game.add.sprite(0, 0, 'tank', 'tank_turret.png');
    turret.anchor.setTo(0.19, 0.5);

    shadow = game.add.sprite(0, 0, 'tank', 'tank_shadow.png');
    shadow.anchor.setTo(0.45, 0.45);

    tank.bringToTop();
    turret.bringToTop();


    //fix to tank start on center of view
    //should change game.camera view, but i've facing a issue that camera does not follow tank anymore
    tank.x = 600;
    tank.y = 300;

    game.camera.follow(tank);
    game.camera.focusOnXY(600,300);
}

function setupPanel() {
    if (player == 1) {
        setupPlayer1Panel();
    } else {
        setupPlayer2Panel();
    }
}

function setupPlayer1Panel() {
    interfacePlayer = game.add.image(0, 0, 'interfacePlayer1');
    interfacePlayer.fixedToCamera = true;
}

function setupPlayer2Panel() {
    interfacePlayer = game.add.image(0, 0, 'interfacePlayer2');
    interfacePlayer.fixedToCamera = true;

    fireButton = game.add.button(38, 351, 'fireButton', fire, this, 2, 1, 0);
    fireButton.fixedToCamera = true;
}

function update () {
    //collision
    game.physics.arcade.collide(tank, blockedLayer);

    if (cursors.left.isDown) {
        tank.angle -= 4;
    } else if (cursors.right.isDown) {
        tank.angle += 4;
    }

    if (cursors.up.isDown) {
        //  The speed we'll travel at
        currentSpeed = 200;
    } else {
        if (currentSpeed > 0) {
            currentSpeed -= 4;
        }
    }

    if (currentSpeed > 0) {
        game.physics.arcade.velocityFromRotation(tank.rotation, currentSpeed, tank.body.velocity);
    }

    //  Position all the parts and align rotations
    shadow.x = tank.x;
    shadow.y = tank.y;
    shadow.rotation = tank.rotation;

    turret.x = tank.x;
    turret.y = tank.y;

    turret.rotation = game.physics.arcade.angleToPointer(turret);
    // turret.rotation = tank.rotation;
}

function bulletHitEnemy (tank, bullet) {
    bullet.kill();
    var destroyed = enemies[tank.name].damage();
    if (destroyed) {
        var explosionAnimation = explosions.getFirstExists(false);
        explosionAnimation.reset(tank.x, tank.y);
        explosionAnimation.play('kaboom', 30, false, true);
    }
}

function fire () {
    if (game.time.now > nextFire && bullets.countDead() > 0)    {
        nextFire = game.time.now + fireReloadDelay;
        var bullet = bullets.getFirstExists(false);
        bullet.reset(turret.x, turret.y);
        bullet.rotation = turret.rotation;
        bullet.body.velocity = game.physics.arcade.velocityFromAngle(bullet.angle, 300);
    }
}

function render () {
    // game.debug.text('Active Bullets: ' + bullets.countLiving() + ' / ' + bullets.length, 32, 32);
    // game.debug.text('Enemies: ' + enemiesAlive + ' / ' + enemiesTotal, 32, 32);
}