
// syncs player with server
var network_player;

function NetworkPlayer(socket, player_id) {
    this.socket = socket;
    this.id = player_id;
    this.name = '';
}

NetworkPlayer.prototype.setName = function(name) {
    this.name = name;
    this.socket.emit('settings', {'name': name});
};

// override these callbacks to receive the network events
var network_callbacks = {
    global_players_count: function(count) {},
    global_games_list: function(games) {},
    global_error: function(error) { alert(error.message); },
    game_join: function(game_id, state) { network_register_game(state); },
};

var network_handlers = {
    game_join: null,
};


function network_register_main() {
    namespace = '/main';
    var socket = io.connect('http://' + document.domain + ':' + location.port + namespace);
    // receive handler for global data
    socket.on('global', function(global) {
        network_callbacks[global_players_count](global.players_count);
        network_callbacks[global_games_list](global.games);
    });
    // receive handler for player data
    socket.on('player', function(data) {
        network_player = NetworkPlayer(socket, data.player_id);
    });
    socket.on('settings', function(settings) {
        network_player.setName(settings.name);
    });
    // handlers for the UI actions
    network_handlers[game_join] = function() {
        socket.emit('join');
    };
    // receive handler for new game
    socket.on('state', function(state) {
        network_callbacks[game_join](state.game_id, state);
    });
    // receive handler for error messages
    socket.on('error', function(error) {
        network_callbacks[global_error](error);
    });
}

function network_register_game() {

}
