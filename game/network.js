
// syncs player with server
var network_player;

function NetworkPlayer(socket, player_id) {
    this.socket = socket;
    this.id = player_id;
    this.name = '';
    this.number = undefined;
}

NetworkPlayer.prototype.setName = function(name) {
    this.name = name;
    this.socket.emit('settings', {'name': name});
};

// override these callbacks to receive the network events
var network_callbacks = {
    global_player_update: function(player) {},
    global_players_count: function(count) {},
    global_games_list: function(games) {},
    global_error: function(error) { alert(error.message); },
    game_room_will_join: function(game_id, state) {},
    game_room_did_join: function(game_id, players) {},
    game_room_update_join: function(player_id, player_name) {},
    game_room_update_leave: function(player_id) {},
    game_room_update_ready: function(player_id) {},
    game_will_start: function() {},
    game_did_start: function() {},
    game_move_event: function(movement, rotation) {},
    game_move_turret: function(angle) {},
};

// call these handler functions to perform network operations
var network_handlers = {
    game_room_join: function() {},
    game_room_ready: function() {},
    control_lever_left: function(value) {},
    control_lever_right: function(value) {},
};


function network_register_main() {
    namespace = '/main';
    var socket = io.connect('http://' + document.domain + ':' + location.port + namespace);
    // receive handler for global data
    socket.on('global', function(global) {
        network_callbacks.global_players_count(global.players_count);
        network_callbacks.global_games_list(global.games);
    });
    // receive handler for player data
    socket.on('player', function(data) {
        network_player = new NetworkPlayer(socket, data.player_id);
    });
    socket.on('settings', function(settings) {
        network_player.name = settings.name;
        network_callbacks.global_player_update(network_player);
    });
    // handlers for the UI actions
    network_handlers.game_room_join = function() {
        socket.emit('join');
    };
    // receive handler for new game
    socket.on('state', function(state) {
        network_callbacks.game_room_will_join(state.game_id, state);
        network_register_game(state);
    });
    // receive handler for error messages
    socket.on('error', function(error) {
        network_callbacks.global_error(error);
    });
}

var NetworkStates = {
    'WAITING': 0,
    'RUNNING': 1,
    0: 'WAITING',
    1: 'RUNNING',
};
var network_sync = {
    clock: 0,
    state: 0,
};

function network_register_game(state) {
    namespace = '/game';
    var socket = io.connect('http://' + document.domain + ':' + location.port + namespace);
    // init room state
    network_callbacks.game_room_did_join(state.game_id, state.players);
    // listen room events
    socket.on('join', function(join) {
        network_callbacks.game_room_update_join(join.player_id, join.player_name);
    });
    socket.on('leave', function(leave) {
        network_callbacks.game_room_update_leave(leave.player_id);
    });
    socket.on('ready', function(ready) {
        network_callbacks.game_room_update_ready(ready.player_id);
    });
    socket.on('event-game-start', function(data) {
        network_sync.clock = data.clock;
        network_callbacks.game_will_start();
        socket.emit('event-game-start-ack');
    });
    socket.on('event-clock-sync', function(data) {
        network_sync.clock = data.clock;
        if (network_sync.clock < data.wait) {
            network_sync.state = NetworkStates['WAITING'];
        } else {
            network_sync.state = NetworkStates['RUNNING'];
            network_callbacks.game_did_start();
        }
    });
    // receive handler for movement events
    socket.on('event-movement', function(data) {
        network_sync.clock = data.clock;
        network_callbacks.game_move_event(data.x, data.r);
    });

    // receive handler for movement events
    socket.on('turret-movement', function(data) {
        network_sync.clock = data.clock;
        network_callbacks.game_move_turret(data.angle);
    });
    // handlers for UI actions
    network_handlers.game_room_ready = function() {
        socket.emit('ready');
    };
    network_handlers.control_lever_left = function(value) {
        socket.emit('control-left', value);
    };
    network_handlers.control_lever_right = function(value) {
        socket.emit('control-right', value);
    };
    network_handlers.control_turret = function(value) {
        socket.emit('control-turret', value);
    };
}
