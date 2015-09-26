
from flask import Flask, render_template, session
from flask.ext.socketio import SocketIO, emit, join_room

import uuid

app = Flask(__name__)
app.config.update(
    DEBUG=True,
    SECRET_KEY='mostly-harmless!'
)
socketio = SocketIO(app)


'''
Namespace flow: -> main -> state

'''

MIN_PLAYERS = MAX_PLAYERS = 2

PLAYER = {}

STATE = {
    'game_id': uuid.uuid4().hex,
    'players': {},
    'map_id': 0,
}

GLOBAL = {
    'players_count': 0,
    'games': [STATE['game_id']],
}


# main screen

@app.route('/')
def index():
    return render_template('index.html')


@socketio.on('connect', namespace='/main')
def main_connect():
    player_id = uuid.uuid4().hex
    session['player_id'] = player_id
    join_room(player_id)
    emit('global', GLOBAL, room=player_id)


@socketio.on('join', namespace='/main')
def main_join():
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
    clear_state(session['player_id'])


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
        print('All players ready to start game')
        # setup new game
        # init event timers
        pass


@socketio.on('disconnect', namespace='/game')
def state_disconnect():
    game_id = STATE['game_id']
    player_id = session['player_id']
    print('Client [%s] disconnected from game [%s]' % (player_id, game_id))
    emit('leave', {'player_id': player_id}, room=game_id, broadcast=True)
    clear_state(player_id)
    #emit('state', STATE, room=game_id, broadcast=True)


# game state


# helper functions

def update_global():
    GLOBAL['players_count'] = len(STATE['players'])
    emit('global', GLOBAL, namespace='/main', broadcast=True)


def clear_state(player_id):
    if player_id not in STATE['players']:
        return
    STATE['players'].pop(player_id)
    update_global()


if __name__ == '__main__':
    socketio.run(app)
