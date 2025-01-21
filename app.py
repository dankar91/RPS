import os
import sys
import logging
import eventlet
eventlet.monkey_patch()

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO
from gamelogic import GameLogic
from handtracking import HandGestureRecognizer

# Настройка логирования
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Инициализация Flask
app = Flask(__name__)

# Инициализация распознавателя жестов
hand_recognizer = HandGestureRecognizer()

@app.route('/detect_gesture', methods=['POST'])
def detect_gesture():
    """Определение жеста по landmarks"""
    try:
        landmarks = request.json['landmarks']
        gesture = hand_recognizer.detect_gesture(landmarks)
        translation = hand_recognizer.translate_gesture(gesture) if gesture else None
        return jsonify({
            'gesture': gesture,
            'translation': translation
        })
    except Exception as e:
        logger.error(f'Error detecting gesture: {str(e)}')
        return jsonify({'error': str(e)}), 400

app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'dev_key_123')
app.config['DEBUG'] = True

try:
    logger.info('Initializing SocketIO...')
    socketio = SocketIO(
        app,
        cors_allowed_origins="*",
        async_mode='eventlet',
        logger=True,
        engineio_logger=True,
        ping_timeout=60,
        ping_interval=25
    )
    logger.info('SocketIO initialized successfully')
except Exception as e:
    logger.error(f'Failed to initialize SocketIO: {str(e)}', exc_info=True)
    sys.exit(1)

# Инициализация игровой логики
game = GameLogic()

@app.route('/')
def index():
    """Отрендерить главную страницу"""
    return render_template('index.html')


@socketio.on('connect')
def handle_connect():
    """Обработка подключения клиента"""
    logger.info('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    """Обработка отключения клиента"""
    logger.info('Client disconnected')

@socketio.on('player_gesture')
def handle_gesture(data):
    """Обработка жеста игрока"""
    try:
        if game.game_in_progress:
            socketio.emit('error', {'message': 'Game in progress, please wait'})
            return

        game.game_in_progress = True
        gesture_data = data.get('gesture')
        player_gesture = gesture_data.get('final_gesture') if isinstance(gesture_data, dict) else gesture_data
        logger.info(f'Received final player gesture: {player_gesture}')

        if not game.validate_gesture(player_gesture):
            logger.warning(f'Invalid final gesture received: {player_gesture}')
            socketio.emit('error', {'message': 'Invalid gesture'})
            return

        # Получаем выбор AI и определяем победителя
        ai_gesture = game.get_ai_choice()
        winner = game.determine_winner(player_gesture, ai_gesture)

        # Обновляем счет только если жест был распознан
        scores = game.get_scores()
        if winner is not None:
            game.update_score(winner)
            scores = game.get_scores()

        # Отправляем результат
        statistics = game.get_statistics()
        response = {
            'player_gesture': player_gesture,
            'ai_gesture': ai_gesture,
            'winner': winner,
            'scores': scores,
            'statistics': statistics
        }

        socketio.emit('game_result', response)
        game.game_in_progress = False

    except Exception as e:
        game.game_in_progress = False
        logger.error(f'Error processing gesture: {str(e)}')
        socketio.emit('error', {'message': 'Internal server error'})

@socketio.on('reset_game')
def handle_reset():
    """Сброс игры"""
    try:
        logger.info('Resetting game')
        game.scores = {'ai': 0, 'player': 0}
        game.game_history = []
        socketio.emit('game_reset')
    except Exception as e:
        logger.error(f'Error in handle_reset: {str(e)}')
        socketio.emit('error', {'message': 'Error resetting game'})

if __name__ == '__main__':
    try:
        port = int(os.getenv('PORT', 5000))
        logger.info(f'Starting server on port {port}')
        # Используем eventlet для запуска сервера
        eventlet.wsgi.server(
            eventlet.listen(('0.0.0.0', port)),
            app,
            log_output=True
        )
        logger.info('Server started successfully')
    except Exception as e:
        logger.error(f'Failed to start server: {str(e)}', exc_info=True)
        sys.exit(1)
    finally:
        logger.info('Server shutdown')