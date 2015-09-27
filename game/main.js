var game;
var DEBUG = false;

function game_init(player) {
    game = new Phaser.Game(1200, 600, Phaser.CANVAS, 'game');
	// First parameter is how our state will be called.
	// Second parameter is an object containing the needed methods for state functionality
	game.state.add('Welcome', Welcome);
	game.state.add('Menu', Menu);
	game.state.add('Nickname', Nickname);
	game.state.add('Lobby', Lobby);
	game.state.add('Credits', Credits);
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