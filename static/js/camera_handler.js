
class CameraHandler {
    constructor(game) {
        this.game = game;
        this.finalGesture = null;
        this.setupCamera();
    }

    async setupCamera() {
        try {
            // Получаем элемент видео для отображения потока с камеры
            this.videoElement = document.getElementById('video_feed');
            if (!this.videoElement) {
                throw new Error('Video element not found');
            }

            // Настраиваем MediaPipe Hands для отслеживания руки
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            // Конфигурация параметров отслеживания руки
            this.hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.hands.onResults((results) => this.onResults(results));

            // Инициализация и настройка камеры
            const camera = new Camera(this.videoElement, {
                onFrame: async () => {
                    try {
                        await this.hands.send({image: this.videoElement});
                    } catch (error) {
                        console.error('Error processing frame:', error);
                    }
                },
                width: 640,
                height: 480
            });

            // Запуск видеопотока с камеры
            await camera.start();
            console.log('Camera started successfully');

            // Обновление статуса подключения камеры в интерфейсе
            const statusElement = document.getElementById('connection-status');
            if (statusElement) {
                statusElement.className = 'alert alert-success';
                statusElement.textContent = 'Камера подключена';
            }

        } catch (error) {
            console.error('Error setting up camera:', error);
            const statusElement = document.getElementById('connection-status');
            if (statusElement) {
                statusElement.className = 'alert alert-danger';
                statusElement.textContent = 'Ошибка подключения камеры: ' + error.message;
            }
        }
    }

    async onResults(results) {
        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            const debugElement = document.getElementById('gesture-debug');
            if (debugElement) {
                debugElement.textContent = 'Жест не распознан';
            }
            return;
        }

        // Отправка координат ключевых точек руки на сервер для распознавания
        const landmarks = results.multiHandLandmarks[0];
        const response = await fetch('/detect_gesture', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ landmarks })
        });

        const data = await response.json();
        const gesture = data.gesture;
        const translation = data.translation;

        // Обновление отладочной информации на экране
        const debugElement = document.getElementById('gesture-debug');
        if (debugElement) {
            debugElement.textContent = translation || 'Жест не распознан';
        }

        // Обработка распознанного жеста
        if (gesture) {
            const countdownElement = document.querySelector('.countdown');

            if (countdownElement) {
                this.finalGesture = gesture;
            } else if (!countdownElement && this.finalGesture) {
                this.game.handlePlayerMove({
                    gesture: gesture,
                    final_gesture: this.finalGesture
                });
                this.finalGesture = null;
            } else if (!this.game.gameInProgress && !countdownElement) {
                this.game.handlePlayerMove(gesture);
            }
        }
    }
}

// Инициализация обработчика камеры после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.game) {
            window.handTracking = new CameraHandler(window.game);
        } else {
            console.error('Game not initialized');
        }
    }, 1000);
});
