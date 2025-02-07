# Камень, Ножницы, Бумага с распознаванием жестов

Интерактивная веб-игра "Камень, Ножницы, Бумага" с использованием компьютерного зрения для распознавания жестов рук в реальном времени.

<!--
## Особенности

- 🎮 Играйте против ИИ, показывая жесты через веб-камеру
- 👋 Автоматическое распознавание жестов (камень ✊, ножницы ✌️, бумага ✋)
- 📊 Статистика игры и отслеживание счета
- 🎵 Звуковые эффекты
- ⚡ Работа в реальном времени через WebSocket
- 🎯 Анимации и визуальные эффекты
-->

## Структура проекта

```
├── app.py                     # Основной файл сервера Flask
├── gamelogic.py               # Логика игры
├── handtracking.py            # Распознавание жестов
├── static/                    # Статические файлы
│   ├── css/             
│   │   └── game.css           # Стили игры
│   └── js/              
│       ├── camera_handler.js  # Обработка камеры
│       └── game.js            # Клиентская логика игры
├── templates/           
│   └── index.html             # Главная страница
```

## Технологии

- Python
- JavaScript
- MediaPipe
- WebRTC
- Flask
- SocketIO

## Как играть

1. Откройте камеру в браузере
2. Покажите один из трех жестов: ✊ камень, ✌️ ножницы или ✋ бумага
3. Дождитесь обратного отсчета (не меняя жест)
4. ИИ сделает свой выбор
5. Результат раунда будет показан на экране
