var game;
var DEBUG = false;
var networkLag = 40;

function game_init() {
    game = new Phaser.Game(1200, 600, Phaser.CANVAS, 'game');
    game.thisPlayer = undefined;

    game.network = new FirebaseNetwork();
    game.network.init();

    game.state.add('Welcome', Welcome);
    game.state.add('Nickname', Nickname);
	game.state.add('Menu', Menu);
    game.state.add('Credits', Credits);
	game.state.add('Lobby', Lobby);
	game.state.add('Game', Game);
    
	game.state.start('Welcome');
}

function moveTank(movement, rotation){
    game.state.states[game.state.current].moveTank(movement, rotation);
}

function moveTurret(angle){
    game.state.states[game.state.current].moveTurret(angle);
}

function turretFire(){
    game.state.states[game.state.current].turretFire();
}
