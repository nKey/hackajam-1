
from flask import Flask, render_template, session
from flask.ext.socketio import SocketIO, emit, join_room

import uuid

app = Flask(__name__, static_folder='game', template_folder='')
app.config.update(
    DEBUG=True,
    SECRET_KEY='mostly-harmless!'
)
socketio = SocketIO(app)


'''
Namespace flow: -> main -> game



'''

MIN_PLAYERS = MAX_PLAYERS = 2

PLAYER = {}

STATE = {
    'game_id': uuid.uuid4().hex,
    'players': [],
    'map_id': 0,
    'event_clock': 0,
    'movement_components': [0, 0],
    'turret_angle_component': 0,
}

GLOBAL = {
    'players_count': 0,
    'games': [STATE['game_id']],
}


# main screen

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/debug')
def debug():
    return app.send_static_file('index-debug.html')


@socketio.on('connect', namespace='/main')
def main_connect():
    player_id = uuid.uuid4().hex
    session['player_id'] = player_id
    join_room(player_id)
    emit('player', {'player_id': player_id}, room=player_id, broadcast=True)
    emit('global', GLOBAL, room=player_id, broadcast=True)


@socketio.on('join', namespace='/main')
def main_join():
    print("main_socket receive join ", session)
    player_id = session['player_id']
    if player_id in STATE['players']:
        emit('error', {'message': 'Already in room'},
            namespace='/main', room=player_id)
        return
    if len(STATE['players']) >= MAX_PLAYERS:
        emit('error', {'message': 'Max players limit reached'},
            namespace='/main', room=player_id)
        return
    STATE['players'][player_id] = {
        'name': PLAYER.get(player_id),
        'ready': False,
    }
    emit('state', STATE, room=player_id)
    update_global()


@socketio.on('settings', namespace='/main')
def main_settings(data):
    player_id = session['player_id']
    session['player_name'] = data.get('name')
    PLAYER[player_id] = session['player_name']
    emit('settings', {'name': session['player_name']}, room=player_id)


@socketio.on('disconnect', namespace='/main')
def main_disconnect():
    state_clear_player(session['player_id'])


# room screen

@socketio.on('connect', namespace='/game')
def state_connect():
    game_id = STATE['game_id']
    player_id = session['player_id']
    join_room(game_id)
    emit('join', {'player_id': player_id, 'player_name': PLAYER.get(player_id)},
        room=game_id)
    print('Client [%s] connected to game [%s]' % (player_id, game_id))


@socketio.on('ready', namespace='/game')
def state_ready():
    game_id = STATE['game_id']
    player_id = session['player_id']
    STATE['players'][player_id]['ready'] = True
    emit('ready', {'player_id': player_id}, room=game_id, broadcast=True)
    if all(player['ready'] for player_id, player in STATE['players'].iteritems()):
        # start new game
        print('All players ready to start game')
        state_init()
        emit('event_game_start', {'clock': 0}, room=game_id, broadcast=True)


@socketio.on('event_game_start_ack', namespace='/game')
def event_game_start_ack():
    game_id = STATE['game_id']
    STATE['event_clock'] += 1
    emit('event_clock_sync', {'clock': STATE['event_clock'], 'wait': 2},
        room=game_id, broadcast=True)


@socketio.on('disconnect', namespace='/game')
def state_disconnect():
    game_id = STATE['game_id']
    player_id = session['player_id']
    print('Client [%s] disconnected from game [%s]' % (player_id, game_id))
    emit('leave', {'player_id': player_id}, room=game_id, broadcast=True)
    state_clear_player(player_id)
    emit('state', STATE, room=game_id, broadcast=True)


# game events

@socketio.on('control_left', namespace='/game')
def event_control_left(value):
    STATE['movement_components'][0] = value
    event_notify_movement()


@socketio.on('control_right', namespace='/game')
def event_control_right(value):
    STATE['movement_components'][1] = value
    event_notify_movement()


@socketio.on('control_turret', namespace='/game')
def event_control_turret(value):
    STATE['turret_angle_component'] = value
    game_id = STATE['game_id']
    STATE['event_clock'] += 1
    emit('turret_movement', {'angle': value, 'clock': STATE['event_clock']},
        room=game_id, broadcast=True)


@socketio.on('action_fire', namespace='/game')
def event_action_fire():
    game_id = STATE['game_id']
    STATE['event_clock'] += 1
    # TODO: send turrent angle for bullet sync
    emit('action_fire', {'clock': STATE['event_clock']}, room=game_id, broadcast=True)


@socketio.on('dead_reckoning', namespace='/game')
def event_notify_position(data):
    game_id = STATE['game_id']
    STATE['event_clock'] += 1
    data = {
        'x': data.get('x'),
        'y': data.get('y'),
        'angle': data.get('angle'),
        'turret_angle': data.get('turret_angle'),
        'clock': STATE['event_clock'],
    }
    data = {k: v for k, v in data.iteritems() if v is not None}
    emit('event_position', data, room=game_id)


def event_notify_movement():
    game_id = STATE['game_id']
    left, right = STATE['movement_components']
    x = (left / 2.0) + (right / 2.0)
    r = (right / 2.0) - (left / 2.0)
    STATE['event_clock'] += 1
    emit('event_movement', {'x': x, 'r': r, 'clock': STATE['event_clock']},
        room=game_id, broadcast=True)


# helper functions

def update_global():
    GLOBAL['players_count'] = len(STATE['players'])
    emit('global', GLOBAL, namespace='/main', broadcast=True)


# state class

def state_clear_player(player_id):
    if player_id not in STATE['players']:
        return
    STATE['players'].pop(player_id)
    update_global()


def state_init():
    STATE['event_clock'] = 0


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0')
