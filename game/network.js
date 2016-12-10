
// syncs player with server
var this_player;
var network_player;

function Player() {
    this.name = '';
    this.number = undefined;
}

function NetworkPlayer(player_id) {
    this.id = player_id;
    this.name = '';
    this.number = undefined;
}

Player.prototype.setName = function(name) {
    this.name = name;
    main_socket.emit('settings', {'name': name});
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
    game_fire: function() {},
    game_dead_reckoning: function(x, y, angle){}
};

// call these handler functions to perform network operations
var network_handlers = {
    game_room_join: function() {},
    game_room_ready: function() {},
    control_lever_left: function(value) {},
    control_lever_right: function(value) {},
    action_fire: function() {},
    dead_reckoning: function(x, y, angle) {},
};

var main_socket;
var game_socket;

function network_register_main() {
    console.log("network_register_main begin");
    namespace = '/main';
    main_socket = io.connect('http://' + document.domain + ':' + location.port + namespace);

    main_socket.on('connect', function() {
        console.log("main_socket connected");
    });
    // receive handler for player data
    main_socket.on('player', function(data) {
        this_player = new Player(data.player_id);
        console.log("main_socket receive player "+data.player_id);
    });
    // receive handler for global data
    main_socket.on('global', function(global) {
        console.log("main_socket receive global "+JSON.stringify(global));
        network_callbacks.global_players_count(global.players_count);
        network_callbacks.global_games_list(global.games);
    });
    main_socket.on('settings', function(settings) {
        console.log("main_socket receive settings "+JSON.stringify(settings));
        // network_player.name = settings.name;
        network_callbacks.global_player_update(network_player);
    });
    // handlers for the UI actions
    network_handlers.game_room_join = function() {
        console.log("main_socket emit join");
        main_socket.emit('join');
    };
    // receive handler for new game
    main_socket.on('state', function(state) {
        console.log("main_socket receive state "+JSON.stringify(state));
        network_callbacks.game_room_will_join(state.game_id, state);
        network_register_game(state);
    });
    // receive handler for error messages
    main_socket.on('error', function(error) {
        console.log("main_socket receive error "+error);
        network_callbacks.global_error(error);
    });
    console.log("network_register_main end");
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
    game_socket = io.connect('http://' + document.domain + ':' + location.port + namespace);
    // init room state
    network_callbacks.game_room_did_join(state.game_id, state.players);
    // listen room events
    game_socket.on('join', function(join) {
        console.log("game_socket receive join "+JSON.stringify(join));
        network_callbacks.game_room_update_join(join.player_id, join.player_name);
    });
    game_socket.on('leave', function(leave) {
        console.log("game_socket receive leave "+JSON.stringify(leave));
        network_callbacks.game_room_update_leave(leave.player_id);
    });
    game_socket.on('ready', function(ready) {
        console.log("game_socket receive ready "+JSON.stringify(ready));
        network_callbacks.game_room_update_ready(ready.player_id);
    });
    game_socket.on('event_game_start', function(data) {
        console.log("game_socket receive event_game_start "+JSON.stringify(data));
        network_sync.clock = data.clock;
        network_callbacks.game_will_start();
        game_socket.emit('event_game_start_ack');
    });
    game_socket.on('event_clock_sync', function(data) {
        console.log("game_socket receive event_clock_sync "+JSON.stringify(data));
        network_sync.clock = data.clock;
        if (network_sync.clock < data.wait) {
            network_sync.state = NetworkStates['WAITING'];
        } else {
            network_sync.state = NetworkStates['RUNNING'];
            network_callbacks.game_did_start();
        }
    });
    // receive handler for movement events
    game_socket.on('event_movement', function(data) {
        console.log("game_socket receive event_movement "+JSON.stringify(data));
        network_sync.clock = data.clock;
        network_callbacks.game_move_event(data.x, data.r);
    });
    // receive handler for movement events
    game_socket.on('turret_movement', function(data) {
        console.log("game_socket receive turret_movement "+JSON.stringify(data));
        network_sync.clock = data.clock;
        network_callbacks.game_move_turret(data.angle);
    });
    // receive handler for movement events
    game_socket.on('action_fire', function(data) {
        console.log("game_socket receive action_fire "+JSON.stringify(data));
        network_sync.clock = data.clock;
        network_callbacks.game_fire();
    });
    game_socket.on('event_position', function(data) {
        console.log("game_socket receive event_position "+JSON.stringify(data));
        network_sync.clock = data.clock;
        network_callbacks.game_dead_reckoning(data.x, data.y, data.angle);
    });
    // handlers for UI actions
    network_handlers.game_room_ready = function() {
        game_socket.emit('ready');
    };
    network_handlers.control_lever_left = function(value) {
        game_socket.emit('control_left', value);
    };
    network_handlers.control_lever_right = function(value) {
        game_socket.emit('control_right', value);
    };
    network_handlers.control_turret = function(value) {
        game_socket.emit('control_turret', value);
    };
    network_handlers.action_fire = function() {
        game_socket.emit('action_fire');
    };
    network_handlers.dead_reckoning = function(x, y, angle) {
        game_socket.emit('dead_reckoning', {x: x, y: y, angle: angle});
    };
}
