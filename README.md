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

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![MediaPipe](https://img.shields.io/badge/MediaPipe-4285F4?style=for-the-badge&logo=google&logoColor=white)
![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=webrtc&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)

## Как играть

1. Откройте камеру в браузере
2. Покажите один из трех жестов: ✊ камень, ✌️ ножницы или ✋ бумага
3. Дождитесь обратного отсчета (не меняя жест)
4. ИИ сделает свой выбор
5. Результат раунда будет показан на экране
